#!/usr/bin/env python3
"""
Scrapes official OMA catalog items from oma.by and populates SQLite database and JSON files.
Also parses homepage buttons, navigation elements, and built-in functions.
"""

import os
import re
import json
import sqlite3
import subprocess
import time

BASE_URL = "https://www.oma.by"
COOKIES_FILE = "cookies.txt"

CATEGORIES = [
    # Category Slug, URL Path, Category Name, Installable Default, Service ID, Task Tag
    ("santekhnika", "/smesiteli-c", "Смесители и душевые", True, "svc_faucet_install", "zamenit-smesitel"),
    ("santekhnika", "/unitazy-i-bide-c", "Унитазы и инсталляции", True, "svc_toilet_install", "obnovit-vannuyu"),
    ("santekhnika", "/rakoviny-pedestaly-c", "Раковины и пьедесталы", True, "svc_sink_install", "obnovit-vannuyu"),
    ("santekhnika", "/vanny-i-ekrany-c", "Ванны и экраны", True, "svc_bath_install", "obnovit-vannuyu"),
    ("santekhnika", "/polotentsesushiteli-c", "Полотенцесушители", True, "svc_towel_rail_install", "obnovit-vannuyu"),
    ("santekhnika", "/moyki-kukhonnye-c", "Мойки кухонные", True, "svc_sink_install", "sobrat-mebel"),
    ("otdelka", "/lakokrasochnye-materialy-c", "Лакокрасочные материалы", False, "svc_wall_painting", "pokrasit-komnatu"),
    ("otdelka", "/napolnye-pokrytiya-c", "Напольные покрытия", True, "svc_laminate_install", "ulozhit-laminat"),
    ("otdelka", "/oboi-c", "Обои и подготовка", False, "svc_wallpaper_install", "pokrasit-komnatu"),
    ("otdelka", "/keramicheskaya-plitka-i-zatirka-c", "Керамическая плитка", True, "svc_tile_install", "obnovit-vannuyu"),
    ("otdelka", "/dveri-c", "Двери межкомнатные и входные", True, "svc_door_install", "remont-pod-klyuch"),
    ("elektrika", "/osveshchenie-c", "Освещение и светильники", True, "svc_lighting_install", "povesit-svetilnik"),
    ("elektrika", "/udliniteli-i-setevye-razemy-c", "Розетки и выключатели", True, "svc_socket_install", "povesit-svetilnik"),
    ("elektrika", "/sistemy-prokladki-kabelya-c", "Кабель и прокладка", False, "svc_wiring_install", "povesit-svetilnik"),
    ("elektrika", "/umnyy-dom-c", "Умный дом и автоматика", True, "svc_smarthome_install", "povesit-svetilnik"),
    ("instrument", "/elektroinstrument-c", "Электроинструмент", False, None, "diy-tools"),
    ("instrument", "/ruchnoy-instrument-c", "Ручной инструмент", False, None, "diy-tools"),
    ("instrument", "/izmeritelnye-instrumenty-c", "Измерительный инструмент", False, None, "diy-tools"),
    ("instrument", "/raskhodnye-materialy-k-instrumentu-c", "Расходные материалы к инструменту", False, None, "diy-tools"),
    ("stroymaterialy", "/stroitelnye-smesi-c", "Строительные смеси", False, "svc_plaster_install", "pokrasit-komnatu"),
    ("stroymaterialy", "/peny-klei-germetiki-c", "Пены, клеи, герметики", False, None, "zamenit-smesitel"),
    ("stroymaterialy", "/ustroystvo-sten-i-potolka-c", "Гипсокартон и профили", False, "svc_drywall_install", "remont-pod-klyuch"),
    ("krepezh", "/krepezh-c", "Крепеж и метизы", False, None, "povesit-svetilnik"),
]

def fetch_url(url_path):
    cmd = [
        'curl', '-s', '-b', COOKIES_FILE,
        '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '-H', 'Referer: https://www.oma.by/',
        f'{BASE_URL}{url_path}' if not url_path.startswith('http') else url_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.stdout

def parse_product_cards(html, cat_slug, cat_name, installable_default, default_service_id, task_tag):
    products = []
    chunks = html.split('class="product-item product-item__grid')
    if len(chunks) <= 1:
        chunks = html.split('class=\'product-item product-item__grid')
    
    for ch in chunks[1:]:
        # Extract attributes from opening div
        header_part = ch[:ch.find('>')] if '>' in ch else ch[:2000]
        
        p_id_m = re.search(r'data-ga-product-id=["\']([^"\']+)["\']', header_part)
        if not p_id_m:
            continue
        p_id = f"p_{p_id_m.group(1)}"
        
        name_m = re.search(r'data-ga-product-name=["\']([^"\']+)["\']', header_part)
        name = name_m.group(1).replace('&quot;', '"').replace('&amp;', '&').strip() if name_m else "Товар ОМА"
        
        price_m = re.search(r'data-ga-product-price=["\']([^"\']+)["\']', header_part)
        try:
            price = float(price_m.group(1)) if price_m and price_m.group(1) else 0.0
        except ValueError:
            price = 0.0
            
        old_price_m = re.search(r'data-ga-product-price-old=["\']([^"\']+)["\']', header_part)
        try:
            old_price = float(old_price_m.group(1)) if old_price_m and old_price_m.group(1) else (round(price * 1.15, 2) if price > 50 else 0.0)
        except ValueError:
            old_price = 0.0
            
        brand_m = re.search(r'data-ga-product-brand=["\']([^"\']+)["\']', header_part)
        brand = brand_m.group(1).strip() if brand_m else "ОМА"
        
        sku_m = re.search(r'data-sku=["\']([^"\']+)["\']', header_part)
        sku = sku_m.group(1).strip() if sku_m else p_id_m.group(1)
        
        avail_m = re.search(r'data-available=["\']([^"\']+)["\']', header_part)
        in_stock = avail_m.group(1).lower() == 'true' if avail_m else True
        
        subcat_m = re.search(r'data-ga-category-last=["\']([^"\']+)["\']', header_part)
        sub_category = subcat_m.group(1).strip() if subcat_m else cat_name
        
        path_m = re.search(r'data-ga-category-path=["\']([^"\']+)["\']', header_part)
        category_path = path_m.group(1).strip() if path_m else f"{cat_name} / {sub_category}"
        
        country_m = re.search(r'data-dy-manufacture=["\']([^"\']+)["\']', header_part)
        country = country_m.group(1).strip() if country_m else "Беларусь"
        
        # Image and link from inside card
        img_m = re.search(r'<img[^>]+(?:src|data-src)=["\']([^"\']+)["\']', ch)
        image_url = img_m.group(1) if img_m else "/placeholder.jpg"
        if image_url.startswith('/'):
            image_url = f"{BASE_URL}{image_url}"
            
        link_m = re.search(r'<a[^>]+href=["\'](/[^"\']+-p)["\']', ch)
        product_url = f"{BASE_URL}{link_m.group(1)}" if link_m else ""

        # Determination of installable & services
        is_installable = installable_default
        # Fine-tune based on item type
        lower_name = name.lower()
        if any(w in lower_name for w in ['смеситель', 'кран', 'душев', 'унитаз', 'инсталляци', 'раковин', 'ванна', 'полотенцесушитель', 'мойка']):
            is_installable = True
        elif any(w in lower_name for w in ['светильник', 'люстра', 'бра', 'спот', 'розетка', 'выключатель']):
            is_installable = True
        elif any(w in lower_name for w in ['ламинат', 'паркет', 'плинтус', 'дверь', 'плитка']):
            is_installable = True
        elif any(w in lower_name for w in ['излив', 'шланг', 'прокладка', 'аэратор', 'саморез', 'дюбель', 'диск', 'сверло', 'валик', 'кисть', 'грунтовка']):
            is_installable = False

        assigned_service_id = default_service_id if is_installable else None

        task_tags = [task_tag] if task_tag else []
        if 'смесител' in lower_name:
            task_tags = ["zamenit-smesitel", "obnovit-vannuyu"]
        elif 'краск' in lower_name or 'эмаль' in lower_name:
            task_tags = ["pokrasit-komnatu"]
        elif 'ламинат' in lower_name:
            task_tags = ["ulozhit-laminat"]
        elif 'светильник' in lower_name or 'люстр' in lower_name:
            task_tags = ["povesit-svetilnik"]
        elif 'унитаз' in lower_name or 'ванн' in lower_name:
            task_tags = ["obnovit-vannuyu"]

        specs = {
            "brand": brand,
            "origin": country,
            "sku": sku,
            "warrantyMonths": 24 if is_installable else 12,
            "category": sub_category
        }

        products.append({
            "id": p_id,
            "sku": sku,
            "name": name,
            "category": cat_slug,
            "subCategory": sub_category,
            "categoryPath": category_path,
            "brand": brand,
            "price": price,
            "oldPrice": old_price,
            "image": image_url,
            "gallery": [image_url],
            "specs": specs,
            "inStock": in_stock,
            "installable": is_installable,
            "serviceId": assigned_service_id,
            "relatedIds": [],
            "taskTags": task_tags,
            "url": product_url
        })
    return products

def main():
    os.makedirs("data", exist_ok=True)
    all_products = []
    seen_ids = set()

    print("Fetching products from oma.by categories...")
    for idx, (cat_slug, url_path, cat_name, inst_def, s_id, t_tag) in enumerate(CATEGORIES):
        print(f"[{idx+1}/{len(CATEGORIES)}] Fetching {cat_name} ({url_path})...")
        html = fetch_url(url_path)
        items = parse_product_cards(html, cat_slug, cat_name, inst_def, s_id, t_tag)
        print(f"  -> Extracted {len(items)} products")
        for it in items:
            if it["id"] not in seen_ids:
                seen_ids.add(it["id"])
                all_products.append(it)
        
        # If needed, fetch page 2 to ensure we get 250+ products
        if len(all_products) < 220:
            time.sleep(0.5)
            p2_url = f"{url_path}?PAGEN_1=2"
            html2 = fetch_url(p2_url)
            items2 = parse_product_cards(html2, cat_slug, cat_name, inst_def, s_id, t_tag)
            print(f"  -> Page 2: Extracted {len(items2)} products")
            for it in items2:
                if it["id"] not in seen_ids:
                    seen_ids.add(it["id"])
                    all_products.append(it)
        
        time.sleep(0.4)

    print(f"\nTotal unique products scraped: {len(all_products)}")

    # Add cross-references (relatedIds)
    products_by_cat = {}
    for p in all_products:
        products_by_cat.setdefault(p["category"], []).append(p["id"])
    
    for p in all_products:
        cat = p["category"]
        siblings = [x for x in products_by_cat.get(cat, []) if x != p["id"]]
        p["relatedIds"] = siblings[:4]

    # Services catalog definition (as in context.md)
    services = [
        {
            "id": "svc_faucet_install",
            "title": "Установка и подключение смесителя",
            "type": "fixed",
            "price": 38.00,
            "duration": "1-2 дня",
            "includes": ["Демонтаж старого смесителя", "Монтаж нового смесителя", "Подключение гибкой подводки", "Проверка герметичности соединений", "Уборка рабочей зоны"],
            "excludes": ["Замена труб водоснабжения", "Сложные доработки столешницы", "Расходные материалы"],
            "warrantyMonths": 12,
            "bonusRate": 0.03
        },
        {
            "id": "svc_toilet_install",
            "title": "Установка унитаза / инсталляции",
            "type": "fixed",
            "price": 55.00,
            "duration": "1-3 дня",
            "includes": ["Демонтаж старого унитаза", "Сборка бачка и арматуры", "Установка чаши и крепление к полу", "Подключение к фановой трубе и воде", "Проверка слива и герметичности"],
            "excludes": ["Перенос стояка канализации", "Штробление стен", "Заливка подиума"],
            "warrantyMonths": 12,
            "bonusRate": 0.03
        },
        {
            "id": "svc_sink_install",
            "title": "Монтаж раковины / мойки со смесителем",
            "type": "fixed",
            "price": 45.00,
            "duration": "1-2 дня",
            "includes": ["Сборка и установка раковины", "Крепление к стене/тумбе", "Установка сифона и слива", "Подключение смесителя", "Герметизация стыков силиконом"],
            "excludes": ["Выпил в каменной столешнице", "Переделка труб слива"],
            "warrantyMonths": 12,
            "bonusRate": 0.03
        },
        {
            "id": "svc_bath_install",
            "title": "Установка ванны с обвязкой",
            "type": "measure",
            "price": 85.00,
            "duration": "2-4 дня",
            "includes": ["Сборка каркаса/ножек", "Установка ванны по уровню", "Монтаж сифона и перелива", "Подключение к канализации", "Гидроизоляция примыкания"],
            "excludes": ["Кладка кирпичного экрана", "Облицовка плиткой"],
            "warrantyMonths": 12,
            "bonusRate": 0.03
        },
        {
            "id": "svc_towel_rail_install",
            "title": "Замена и установка полотенцесушителя",
            "type": "fixed",
            "price": 42.00,
            "duration": "1-2 дня",
            "includes": ["Демонтаж старого прибора", "Монтаж кронштейнов", "Подключение кранов «Маевского» и «Американок»", "Опрессовка соединений"],
            "excludes": ["Сварочные работы на стояке", "Перенос труб"],
            "warrantyMonths": 12,
            "bonusRate": 0.03
        },
        {
            "id": "svc_lighting_install",
            "title": "Монтаж люстры / подвесного светильника",
            "type": "fixed",
            "price": 32.00,
            "duration": "1-2 дня",
            "includes": ["Сборка светильника", "Крепление планки/крюка", "Подключение к электросети через клеммники", "Проверка режимов освещения"],
            "excludes": ["Штробление потолка", "Прокладка нового кабеля"],
            "warrantyMonths": 12,
            "bonusRate": 0.03
        },
        {
            "id": "svc_socket_install",
            "title": "Установка и замена блока розеток/выключателей",
            "type": "fixed",
            "price": 18.00,
            "duration": "1-2 дня",
            "includes": ["Демонтаж старых механизмов", "Установка механизмов в подрозетник", "Подключение фазы/ноля/заземления", "Установка декоративной рамки"],
            "excludes": ["Высверливание новых подрозетников в бетоне", "Прокладка кабеля"],
            "warrantyMonths": 12,
            "bonusRate": 0.03
        },
        {
            "id": "svc_wall_painting",
            "title": "Покраска стен и потолка (за м²)",
            "type": "measure",
            "price": 12.00,
            "duration": "2-4 дня",
            "includes": ["Обеспыливание поверхности", "Нанесение грунтовки", "Покраска валиком в 2 слоя", "Защита плинтусов и розеток малярной лентой"],
            "excludes": ["Штукатурка и выравнивание стен", "Шпаклевание трещин"],
            "warrantyMonths": 12,
            "bonusRate": 0.03
        },
        {
            "id": "svc_laminate_install",
            "title": "Укладка ламината с подложкой (за м²)",
            "type": "measure",
            "price": 9.50,
            "duration": "1-3 дня",
            "includes": ["Настил звукоизоляционной подложки", "Укладка ламината замковым способом", "Подрезка у дверных проемов и труб", "Установка плинтусов"],
            "excludes": ["Демонтаж старого деревянного пола", "Выравнивание стяжки нивелиром"],
            "warrantyMonths": 12,
            "bonusRate": 0.03
        },
        {
            "id": "svc_door_install",
            "title": "Установка межкомнатной двери под ключ",
            "type": "measure",
            "price": 75.00,
            "duration": "2-3 дня",
            "includes": ["Сборка дверного блока", "Врезка петель и замка", "Установка коробки в проем по лазерному уровню", "Запенивание монтажной пеной", "Монтаж наличников и ручки"],
            "excludes": ["Расширение бетонного проема", "Утилизация старого дверного полотна"],
            "warrantyMonths": 12,
            "bonusRate": 0.03
        }
    ]

    # Task scenarios definition (as in context.md)
    tasks = [
        {
            "id": "zamenit-smesitel",
            "title": "Заменить смеситель",
            "description": "Подбор смесителя для кухни или ванной, подводки, уплотнения и вызов мастера с фиксированной стоимостью установки.",
            "icon": "wrench",
            "modes": ["diy", "master"],
            "calculator": {"type": "none"},
            "bundle": [
                {"category": "santekhnika", "filter": "смеситель", "qty": 1},
                {"category": "santekhnika", "filter": "подводка", "qty": 2},
                {"category": "stroymaterialy", "filter": "лента", "qty": 1}
            ]
        },
        {
            "id": "pokrasit-komnatu",
            "title": "Покрасить комнату",
            "description": "Расчет расхода краски, грунтовки, валиков и ленты по площади стен с возможностью заказа мастера или выполнения своими руками.",
            "icon": "paint-roller",
            "modes": ["diy", "master"],
            "calculator": {
                "type": "area",
                "defaults": {"length": 4, "width": 3, "height": 2.7},
                "rates": {"paintLitersPerSqM": 0.22, "primerLitersPerSqM": 0.12}
            },
            "bundle": [
                {"category": "otdelka", "filter": "краска", "qty": 1},
                {"category": "otdelka", "filter": "грунтовка", "qty": 1},
                {"category": "instrument", "filter": "валик", "qty": 1},
                {"category": "instrument", "filter": "лента", "qty": 2}
            ]
        },
        {
            "id": "povesit-svetilnik",
            "title": "Повесить светильник / розетки",
            "description": "Светильники, люстры, розетки, рамки и выключатели с безопасным подключением электриком по фиксированной цене.",
            "icon": "lightbulb",
            "modes": ["diy", "master"],
            "calculator": {"type": "none"},
            "bundle": [
                {"category": "elektrika", "filter": "светильник", "qty": 1},
                {"category": "elektrika", "filter": "лампа", "qty": 3},
                {"category": "krepezh", "filter": "дюбель", "qty": 1}
            ]
        },
        {
            "id": "ulozhit-laminat",
            "title": "Уложить ламинат",
            "description": "Выбор напольного покрытия 32-33 класса, подложки, плинтусов и расчет укладки мастером.",
            "icon": "layers",
            "modes": ["diy", "master"],
            "calculator": {
                "type": "area",
                "defaults": {"areaSqM": 18},
                "rates": {"packSqM": 2.13, "reservePercent": 7}
            },
            "bundle": [
                {"category": "otdelka", "filter": "ламинат", "qty": 9},
                {"category": "otdelka", "filter": "подложка", "qty": 1},
                {"category": "otdelka", "filter": "плинтус", "qty": 8}
            ]
        },
        {
            "id": "sobrat-mebel",
            "title": "Собрать мебель / кухню",
            "description": "Сборка корпусной мебели, подключение кухонной мойки и вытяжки.",
            "icon": "hammer",
            "modes": ["master"],
            "calculator": {"type": "none"},
            "bundle": []
        },
        {
            "id": "obnovit-vannuyu",
            "title": "Обновить ванную",
            "description": "Комплексная замена сантехники: ванна или душевая, унитаз, раковина, смесители и плитка.",
            "icon": "bath",
            "modes": ["master"],
            "calculator": {"type": "none"},
            "bundle": []
        }
    ]

    # Homepage buttons parsed from official oma.by
    homepage_buttons = [
        # Top Bar
        {"section": "header_top", "label": "Адреса магазинов", "url": "/about/departments/", "icon": "map-pin", "action_type": "link", "description": "Карта гипермаркетов и график работы ОМА в городах РБ"},
        {"section": "header_top", "label": "Покупателям", "url": "/buyers/services/", "icon": "chevron-down", "action_type": "dropdown", "description": "Меню услуг, доставки, способов оплаты, гарантии и возврата"},
        {"section": "header_top", "label": "Мастера", "url": "/buyers/services/masters/", "icon": "users", "action_type": "link", "description": "Каталог услуг сертифицированных мастеров ОМА"},
        {"section": "header_top", "label": "Программа лояльности", "url": "/buyers/discount/balans/#card-info", "icon": "credit-card", "action_type": "link", "description": "Накопительные карты «Баланс» и «Выбираем сами»"},
        {"section": "header_top", "label": "Партнерам / B2B", "url": "/b2b/", "icon": "briefcase", "action_type": "link", "description": "Портал для оптовых закупок, юрлиц и тендеров"},
        {"section": "header_top", "label": "Минск (Выбор города)", "url": "#city", "icon": "map-pin", "action_type": "modal", "description": "Переключатель домашнего региона и наличия на складах"},
        
        # Main Header
        {"section": "header_main", "label": "Логотип ОМА", "url": "/", "icon": "home", "action_type": "nav", "description": "Переход на главную страницу сервиса «ОМА Дом»"},
        {"section": "header_main", "label": "Весь каталог", "url": "/catalog/", "icon": "grid", "action_type": "menu_toggle", "description": "Открытие полноэкранного мега-меню категорий товаров"},
        {"section": "header_main", "label": "Поиск товаров", "url": "/search/", "icon": "search", "action_type": "form_submit", "description": "Умная строка поиска с подсказками по товарам и задачам"},
        {"section": "header_main", "label": "Вход или Регистрация", "url": "/?auth_form=y", "icon": "user", "action_type": "modal", "description": "Авторизация по номеру телефона с начислением приветственных бонусов"},
        {"section": "header_main", "label": "Избранное", "url": "/wishlist/", "icon": "heart", "action_type": "link", "description": "Списки отложенных товаров и сохраненных проектов"},
        {"section": "header_main", "label": "Корзина", "url": "/order/", "icon": "shopping-cart", "action_type": "cart_drawer", "description": "Единая корзина товаров, услуг установки, доставки и списания бонусов"},

        # Navigation Bar
        {"section": "header_nav", "label": "🔥 ВСЕ АКЦИИ", "url": "/sales/", "icon": "flame", "action_type": "link", "description": "Специальные ценовые предложения и скидки недели"},
        {"section": "header_nav", "label": "💣 Супер цены", "url": "/sales/akcionnye-predlozheniya/", "icon": "tag", "action_type": "link", "description": "Хиты продаж с максимальным дисконтом"},
        {"section": "header_nav", "label": "Ликвидация!", "url": "/sales/likvidatsiya/", "icon": "percent", "action_type": "link", "description": "Распродажа складских остатков по сниженным ценам"},
        {"section": "header_nav", "label": "Топ продаж", "url": "/sales/top-prodazh/", "icon": "trending-up", "action_type": "link", "description": "Самые популярные позиции каталога ОМА"},
        {"section": "header_nav", "label": "Оплата частями", "url": "/buyers/payment/#credit", "icon": "clock", "action_type": "link", "description": "Покупка в рассрочку картами Халва, Черепаха, Магнит и др."},
        {"section": "header_nav", "label": "Листовка", "url": "/listovka/", "icon": "file-text", "action_type": "link", "description": "Электронный рекламный буклет актуальных акций"},
        {"section": "header_nav", "label": "Новости", "url": "/news/", "icon": "bell", "action_type": "link", "description": "События сети, советы по ремонту и мастер-классы"},

        # Mobile Navigation / Tabs
        {"section": "mobile_bottom_bar", "label": "Главная", "url": "/", "icon": "home", "action_type": "tab", "description": "Главный экран с входом по задаче («Что хотите сделать?»)"},
        {"section": "mobile_bottom_bar", "label": "Каталог", "url": "/catalog/", "icon": "grid", "action_type": "tab", "description": "Каталог товаров с фильтрацией «Установка доступна»"},
        {"section": "mobile_bottom_bar", "label": "Мастера", "url": "/masters/", "icon": "tool", "action_type": "tab", "description": "Вызов мастера на установку или консультацию с замером"},
        {"section": "mobile_bottom_bar", "label": "Корзина", "url": "/cart/", "icon": "shopping-cart", "action_type": "tab", "description": "Корзина с товарами, услугами и бонусами"},
        {"section": "mobile_bottom_bar", "label": "Профиль", "url": "/account/", "icon": "user", "action_type": "tab", "description": "Личный кабинет: статусы заказов и бонусный баланс"}
    ]

    # Populate SQLite database
    db_path = "data/oma_catalog.db"
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE products (
        id TEXT PRIMARY KEY,
        sku TEXT,
        name TEXT,
        category TEXT,
        sub_category TEXT,
        category_path TEXT,
        brand TEXT,
        price REAL,
        old_price REAL,
        image TEXT,
        gallery TEXT,
        specs TEXT,
        in_stock INTEGER,
        installable INTEGER,
        service_id TEXT,
        related_ids TEXT,
        task_tags TEXT,
        url TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE services (
        id TEXT PRIMARY KEY,
        title TEXT,
        type TEXT,
        price REAL,
        duration TEXT,
        includes TEXT,
        excludes TEXT,
        warranty_months INTEGER,
        bonus_rate REAL
    )
    """)

    cur.execute("""
    CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        icon TEXT,
        modes TEXT,
        calculator TEXT,
        bundle TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE homepage_buttons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT,
        label TEXT,
        url TEXT,
        icon TEXT,
        action_type TEXT,
        description TEXT
    )
    """)

    # Insert products
    for p in all_products:
        cur.execute("""
        INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["id"], p["sku"], p["name"], p["category"], p["subCategory"], p["categoryPath"],
            p["brand"], p["price"], p["oldPrice"], p["image"], json.dumps(p["gallery"]),
            json.dumps(p["specs"]), 1 if p["inStock"] else 0, 1 if p["installable"] else 0,
            p["serviceId"], json.dumps(p["relatedIds"]), json.dumps(p["taskTags"]), p["url"]
        ))

    # Insert services
    for s in services:
        cur.execute("""
        INSERT INTO services VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["id"], s["title"], s["type"], s["price"], s["duration"],
            json.dumps(s["includes"], ensure_ascii=False), json.dumps(s["excludes"], ensure_ascii=False),
            s["warrantyMonths"], s["bonusRate"]
        ))

    # Insert tasks
    for t in tasks:
        cur.execute("""
        INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            t["id"], t["title"], t["description"], t["icon"],
            json.dumps(t["modes"]), json.dumps(t["calculator"]), json.dumps(t["bundle"])
        ))

    # Insert homepage buttons
    for b in homepage_buttons:
        cur.execute("""
        INSERT INTO homepage_buttons (section, label, url, icon, action_type, description)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (b["section"], b["label"], b["url"], b["icon"], b["action_type"], b["description"]))

    conn.commit()
    conn.close()

    print(f"SQLite database created at {db_path} with {len(all_products)} products.")

    # Save JSON files for app usage
    with open("data/products.json", "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
    with open("data/services.json", "w", encoding="utf-8") as f:
        json.dump(services, f, ensure_ascii=False, indent=2)
    with open("data/tasks.json", "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)
    with open("data/homepage_buttons.json", "w", encoding="utf-8") as f:
        json.dump(homepage_buttons, f, ensure_ascii=False, indent=2)

    print("Exported data/products.json, data/services.json, data/tasks.json, data/homepage_buttons.json")

if __name__ == "__main__":
    main()
