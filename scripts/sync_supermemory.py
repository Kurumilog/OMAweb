#!/usr/bin/env python3
"""Sync project context and agent session logs into Supermemory.

Only project knowledge is stored here (docs + past agent sessions), never the
catalog. User-specific data lives in separate `user_*` namespaces.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://api.supermemory.ai"
NAMESPACE = "omaweb_project"
BATCH_SIZE = 200
PROJECT_DOCS = (
    ("PROGRESS.md", "progress_md", "progress_plan"),
    ("HOMEPAGE.md", "homepage_md", "specification"),
    ("context.md", "context_md", "specification"),
)


def load_env() -> None:
    """Load .env without printing or hardcoding the key."""
    if os.environ.get("SUPERMEMORY_API_KEY"):
        return
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def api(path: str, payload: dict, method: str = "POST", retries: int = 4) -> dict:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=body,
        headers={
            "Authorization": f"Bearer {os.environ['SUPERMEMORY_API_KEY']}",
            "Content-Type": "application/json",
        },
        method=method,
    )

    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            details = error.read().decode("utf-8", errors="replace")
            if error.code in (429, 500, 502, 503, 504) and attempt < retries:
                time.sleep(2 * attempt)
                continue
            raise RuntimeError(f"HTTP {error.code} for {path}: {details}") from error
        except urllib.error.URLError:
            if attempt < retries:
                time.sleep(2 * attempt)
                continue
            raise

    raise RuntimeError(f"Request failed after {retries} attempts: {path}")


def read_text(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def existing_ids() -> set[str]:
    found: set[str] = set()
    page = 1
    while True:
        data = api(f"/ns/{NAMESPACE}/list/documents?limit=100&page={page}", {})
        for document in data.get("documents", []):
            found.add(document.get("id", ""))
        pagination = data.get("pagination") or {}
        if page >= int(pagination.get("totalPages") or 1):
            break
        page += 1
    return found


def build_documents() -> list[dict]:
    documents: list[dict] = []

    for name, doc_id, doc_type in PROJECT_DOCS:
        documents.append(
            {
                "id": doc_id,
                "content": read_text(name),
                "metadata": {"title": name, "type": doc_type},
            }
        )

    sessions_dir = ROOT / "sessions"
    if sessions_dir.exists():
        for path in sorted(sessions_dir.glob("*.md")):
            documents.append(
                {
                    "id": f"session_{path.stem.replace('-', '_')}",
                    "content": path.read_text(encoding="utf-8"),
                    "metadata": {
                        "title": path.name,
                        "type": "agent_session",
                        "date": path.stem[:10],
                    },
                }
            )

    return documents


def sync() -> None:
    load_env()
    if not os.environ.get("SUPERMEMORY_API_KEY"):
        raise SystemExit(
            "SUPERMEMORY_API_KEY is not set. Add it to .env or export it in the shell."
        )

    documents = build_documents()

    if "--force" in sys.argv:
        ids = [doc["id"] for doc in documents]
        for start in range(0, len(ids), 100):
            api(
                f"/ns/{NAMESPACE}/document",
                {"ids": ids[start : start + 100]},
                method="DELETE",
            )
        print(f"Refreshing {len(ids)} project documents.")
    else:
        known = existing_ids()
        before = len(documents)
        documents = [doc for doc in documents if doc["id"] not in known]
        print(f"Skipping {before - len(documents)} documents already in the namespace.")

    if not documents:
        print("Everything is already synced.")
        return

    print(f"Preparing {len(documents)} documents for namespace '{NAMESPACE}'…")

    uploaded = 0
    failed = 0
    for start in range(0, len(documents), BATCH_SIZE):
        batch = documents[start : start + BATCH_SIZE]
        result = api(
            f"/ns/{NAMESPACE}/document/batch",
            {"documents": batch, "taskType": "superrag"},
        )
        uploaded += int(result.get("count") or 0)
        failed += int(result.get("failed") or 0)
        print(
            f"  batch {start // BATCH_SIZE + 1}: "
            f"accepted={result.get('count', 0)} failed={result.get('failed', 0)}"
        )

    print(f"Done. accepted={uploaded}, failed={failed}, namespace={NAMESPACE}")


if __name__ == "__main__":
    sync()
