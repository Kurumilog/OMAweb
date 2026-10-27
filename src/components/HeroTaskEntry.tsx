import React, { useState } from 'react';
import {
  Wrench,
  Paintbrush,
  Lightbulb,
  Layers,
  Armchair,
  Bath,
  ArrowRight,
  Search,
} from 'lucide-react';
import tasksData from '../data/tasks.json';
import { Task } from '../types';

interface HeroTaskEntryProps {
  onSelectTask: (taskId: string) => void;
}

const tasks = tasksData as Task[];

const TASK_ICONS: Record<string, React.ReactNode> = {
  'zamenit-smesitel': <Wrench className="w-5 h-5 text-oma-blue" />,
  'pokrasit-komnatu': <Paintbrush className="w-5 h-5 text-oma-blue" />,
  'povesit-svetilnik': <Lightbulb className="w-5 h-5 text-oma-blue" />,
  'ulozhit-laminat': <Layers className="w-5 h-5 text-oma-blue" />,
  'sobrat-mebel': <Armchair className="w-5 h-5 text-oma-blue" />,
  'obnovit-vannuyu': <Bath className="w-5 h-5 text-oma-blue" />,
};

export const HeroTaskEntry: React.FC<HeroTaskEntryProps> = ({ onSelectTask }) => {
  const [taskQuery, setTaskQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = taskQuery.toLowerCase().trim();
    if (!q) return;

    if (q.includes('смесител') || q.includes('кран') || q.includes('водоп')) {
      onSelectTask('zamenit-smesitel');
    } else if (q.includes('крас') || q.includes('комнат') || q.includes('стен')) {
      onSelectTask('pokrasit-komnatu');
    } else if (q.includes('свет') || q.includes('люстр') || q.includes('розетк')) {
      onSelectTask('povesit-svetilnik');
    } else if (q.includes('ламинат') || q.includes('пол')) {
      onSelectTask('ulozhit-laminat');
    } else if (q.includes('мебел') || q.includes('кухн') || q.includes('шкаф')) {
      onSelectTask('sobrat-mebel');
    } else if (q.includes('ванн') || q.includes('душ') || q.includes('плитк')) {
      onSelectTask('obnovit-vannuyu');
    } else {
      onSelectTask('zamenit-smesitel');
    }
  };

  return (
    <section className="mb-8">
      {/* Main Hero Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-oma-border shadow-card mb-5">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-oma-text mb-2">
            Что хотите сделать?
          </h1>
          <p className="text-sm text-oma-text-secondary mb-5">
            Опишите задачу или выберите готовый сценарий — подберем все необходимые материалы, инструмент и мастера.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 flex items-center bg-oma-surface-alt rounded-xl border border-transparent focus-within:border-oma-blue focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-oma-text-tertiary ml-3.5 shrink-0" />
              <input
                type="text"
                value={taskQuery}
                onChange={(e) => setTaskQuery(e.target.value)}
                placeholder="Например: заменить смеситель на кухне или покрасить стены"
                className="w-full h-11 px-3 bg-transparent text-sm text-oma-text outline-none placeholder:text-oma-text-secondary"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 bg-oma-blue hover:bg-oma-blue-hover text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer text-sm shrink-0"
            >
              <span>Подобрать</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 6 Minimalist Rounded Task Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className="group bg-white rounded-2xl p-5 border border-oma-border hover:border-oma-blue shadow-card hover:shadow-card-hover transition-all text-left flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-oma-surface-alt group-hover:bg-oma-blue-tint transition-colors flex items-center justify-center">
                  {TASK_ICONS[task.id] || <Wrench className="w-5 h-5 text-oma-blue" />}
                </div>
                <ArrowRight className="w-4 h-4 text-oma-text-tertiary group-hover:text-oma-blue group-hover:translate-x-0.5 transition-all" />
              </div>

              <h3 className="font-bold text-base text-oma-text mb-1 group-hover:text-oma-blue transition-colors">
                {task.title}
              </h3>

              <p className="text-xs text-oma-text-secondary line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
