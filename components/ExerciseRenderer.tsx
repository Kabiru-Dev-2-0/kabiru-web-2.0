'use client';
import { useEffect, useState } from 'react';
import { Card } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { ProgressBar, Select, RadioGroup, Radio, makeStyles } from '@fluentui/react-components';
import Editor from '@monaco-editor/react';
import { DndContext, closestCenter, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckmarkCircleRegular, DismissCircleRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  select: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #E8E8E8',
    fontSize: '14px',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  feedback: {
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '16px',
  },
  feedbackCorrect: {
    color: '#22c55e',
  },
  feedbackIncorrect: {
    color: '#ef4444',
  },
  droppable: {
    padding: '16px',
    border: '1px solid #E8E8E8',
    borderRadius: '4px',
    marginBottom: '16px',
    backgroundColor: '#f9fafb',
    height: 'fit-content',
  },
  draggable: {
    padding: '8px',
    backgroundColor: 'white',
    border: '1px solid #E8E8E8',
    borderRadius: '4px',
    marginBottom: '8px',
    cursor: 'grab',
  },
});

// Komponen Droppable untuk drag_and_drop
const Droppable = ({ id, children, items }: { id: string; children: React.ReactNode; items: string[] }) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={useStyles().droppable}>
      {children}
      {items.map((item) => (
        <Draggable key={item} id={item}>
          <div className="py-2 px-3 bg-white border rounded shadow">{item}</div>
        </Draggable>
      ))}
    </div>
  );
};

// Komponen Draggable
const Draggable = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={useStyles().draggable}>
      {children}
    </div>
  );
};

export default function ExerciseRenderer({ exercises }: { exercises: any[] }) {
  const styles = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [feedback, setFeedback] = useState('');
  const exercise = exercises[currentIndex];

  // ⬆️ Taruh ini di bagian atas komponen ExerciseRenderer (sebelum switch)
  const [editorValue, setEditorValue] = useState('');
  const [totalBlanks, setTotalBlanks] = useState(0);

  // Set initial editor value & blank count tiap kali exercise berubah
  useEffect(() => {
    if (exercise.type === 'fill_in_the_blank') {
      setEditorValue(exercise.template_code.replace(/\\n/g, '\n'));
      setTotalBlanks((exercise.template_code.match(/____/g) || []).length);
    }
  }, [exercise]);

  // Handler untuk klik jawaban
  const handleOptionClick = (opt: string) => {
    if (exercise.type !== 'fill_in_the_blank') return;

    setAnswers((prev) => {
      const existingKey = Object.keys(prev).find((k) => prev[k] === opt);

      // Kalau user klik lagi → hapus
      if (existingKey !== undefined) {
        const updated = { ...prev };
        delete updated[existingKey];

        const reverted = editorValue.replace(opt, '____');
        setEditorValue(reverted);
        return updated;
      }

      // Tambahkan jawaban baru ke blank pertama yang kosong
      const nextIndex = Object.keys(prev).length + 1;
      if (nextIndex > totalBlanks) return prev;
      
      const newEditorValue = editorValue.replace('____', opt);
      setEditorValue(newEditorValue);

      return { ...prev, [nextIndex]: opt };
    });
  };

  const handleReset = () => {
    setAnswers({});
    if (exercise.type === 'fill_in_the_blank') {
      setEditorValue(exercise.template_code.replace(/\\n/g, '\n'));
    }
  };


  const handleSubmit = (userAnswer: any) => {
    let isCorrect = false;
    if (exercise.type === 'fill_in_the_blank') {
      isCorrect = userAnswer.every((ans: string, idx: number) => ans === exercise.data.correct_answers[idx]);
    } else if (exercise.type === 'drag_and_drop') {
      const buckets = Object.keys(exercise.data.correct_assignment);
      isCorrect =
        buckets.every((bucket) => {
          const correct = exercise.data.correct_assignment[bucket];
          const user = userAnswer[bucket] || [];
          if (!Array.isArray(correct) || !Array.isArray(user)) return false;
          if (user.length !== correct.length) return false;
          // Bandingkan hasil sort
          return [...user].sort().every((itm, idx) => itm === [...correct].sort()[idx]);
        })
        && buckets.length === Object.keys(userAnswer).length;
    } else if (exercise.type === 'sorting') {
      isCorrect = userAnswer.join(',') === exercise.data.correct_order.join(',');
    } else if (exercise.type === 'guessing' || exercise.type === 'multiple_choice') {
      isCorrect = userAnswer === exercise.data.correct;
    }
    const exerciseSummary = "Benar! +" + exercise.points + " poin 🏆"
    setFeedback(isCorrect ? exerciseSummary : 'Salah, coba lagi! 😔');
    if (isCorrect && currentIndex < exercises.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setAnswers({});
        setFeedback('');
      }, 1000);
    }
  };

  const handleDragEnd = (event: DragEndEvent, type: string) => {
    const { active, over } = event;
    if (!over) return;

    if (type === 'drag_and_drop') {
      const sourceId = (active.data.current?.sortable?.containerId || 'items').toString();
      const destId = over.id.toString();
      const item = active.id.toString();

      // Batasi hanya bucket yang valid
      const validBuckets = ['Bebek', 'Ayam'];
      if (!validBuckets.includes(destId)) return;

      const newAnswers: { [key: string]: string[] } = { ...answers };

      // Bersihkan item dari seluruh buckets valid
      validBuckets.forEach((bucket) => {
        if (Array.isArray(newAnswers[bucket])) {
          newAnswers[bucket] = newAnswers[bucket].filter((i: string) => i !== item);
        }
      });

      // Inisialisasi array jika belum ada
      if (!Array.isArray(newAnswers[destId])) newAnswers[destId] = [];
      newAnswers[destId].push(item);
      setAnswers(newAnswers);
    } else if (type === 'sorting') {
      const items = Array.from(answers.items || exercise.data.code_lines);
      const sourceIndex = active.data.current?.sortable.index;
      const destIndex = over.data.current?.sortable.index || items.indexOf(over.id);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destIndex, 0, reorderedItem);
      setAnswers({ items });
    }
  };

  
  switch (exercise.type) {
    case 'fill_in_the_blank':
    return (
      <Card classNames={{ base: 'w-full max-w-2xl mx-auto p-6 bg-white border-[#E8E8E8]' }}>
        <p className="text-lg font-semibold mb-4">{exercise.prompt}</p>

        <Editor
          height="200px"
          defaultLanguage="html"
          value={editorValue}
          options={{ readOnly: true, fontSize: 14 }}
        />

        <div className="mt-6">
          <p className="text-sm font-medium mb-2">
            Pilih jawaban sesuai urutan blank:
          </p>
          <div className="flex flex-wrap gap-2">
            {exercise.data.options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => handleOptionClick(opt)}
                className={`px-3 py-1.5 rounded border transition-colors ${
                  Object.values(answers).includes(opt)
                    ? 'bg-gray-300 border-gray-400 text-black'
                    : 'bg-white border-gray-300 hover:bg-gray-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {[...Array(totalBlanks)].map((_, idx) => (
            <div key={idx} className="mt-1 text-sm">
              <span className="font-medium mr-2">Blank {idx + 1}:</span>
              <span>{answers[idx + 1] || '(belum dipilih)'}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            className="bg-[#22c55e] text-white px-4 py-2 rounded hover:bg-[#16a34a]"
            onClick={() => handleSubmit(Object.values(answers))}
          >
            Submit
          </Button>
          <Button
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            onClick={handleReset}
          >
            Reset Jawaban
          </Button>
        </div>

        {feedback && (
          <p
            className={`${styles.feedback} ${
              feedback.includes('Benar')
                ? styles.feedbackCorrect
                : styles.feedbackIncorrect
            } flex items-center mt-4`}
          >
            {feedback.includes('Benar') ? (
              <CheckmarkCircleRegular className="mr-2" />
            ) : (
              <DismissCircleRegular className="mr-2" />
            )}
            {feedback}
          </p>
        )}
      </Card>
    );



    case 'drag_and_drop':
      // Logic agar render pertama seluruh item langsung tampil di Items
      const items = (answers['Bebek']?.length > 0 || answers['Ayam']?.length > 0)
        ? exercise.data.items.filter(
            (item: string) => ![...(answers['Bebek'] || []), ...(answers['Ayam'] || [])].includes(item)
          )
        : exercise.data.items;
      const bucketItems = {
        items,
        Bebek: answers['Bebek'] || [],
        Ayam: answers['Ayam'] || []
      };
      let allItems = [...bucketItems.items, ...bucketItems.Bebek, ...bucketItems.Ayam];
      // Deduplicate dan pastikan hanya item valid dari data
      const refItemsSet = new Set(exercise.data.items);
      const uniqueAllItems = allItems.filter((item, i, arr) => arr.indexOf(item) === i && refItemsSet.has(item));
      return (
        <Card
          classNames={{
            base: 'w-full max-w-2xl mx-auto p-6 bg-white border-[#E8E8E8]',
          }}
        >
          <p className="text-lg font-semibold mb-4">{exercise.prompt}</p>
          <DndContext collisionDetection={closestCenter} onDragEnd={(event) => handleDragEnd(event, 'drag_and_drop')}>
            <SortableContext items={uniqueAllItems} strategy={verticalListSortingStrategy}>
              {/* Source items */}
              <Droppable id="items" items={bucketItems.items}>
                <h3 className="text-sm font-medium mb-2">Items 🦢</h3>
              </Droppable>
              {/* Bebek bucket */}
              <Droppable id="Bebek" items={bucketItems.Bebek}>
                <h3 className="text-sm font-medium mb-2">Bebek 🦆</h3>
              </Droppable>
              {/* Ayam bucket */}
              <Droppable id="Ayam" items={bucketItems.Ayam}>
                <h3 className="text-sm font-medium mb-2">Ayam 🐔</h3>
              </Droppable>
            </SortableContext>
          </DndContext>
          <Button
            className="mt-6 bg-[#22c55e] text-white px-4 py-2 rounded hover:bg-[#16a34a]"
            onClick={() => handleSubmit(answers as any)}
          >
            Submit
          </Button>
          {feedback && (
            <p
              className={`${styles.feedback} ${
                feedback.includes('Benar') ? styles.feedbackCorrect : styles.feedbackIncorrect
              }`}
            >
              {feedback.includes('Benar') ? (
                <CheckmarkCircleRegular className="mr-2" />
              ) : (
                <DismissCircleRegular className="mr-2" />
              )}
              {feedback}
            </p>
          )}
        </Card>
      );
    case 'sorting':
      return (
        <Card
          classNames={{
            base: 'w-full max-w-2xl mx-auto p-6 bg-white border-[#E8E8E8]',
          }}
        >
          <p className="text-lg font-semibold mb-4">{exercise.prompt}</p>
          <DndContext collisionDetection={closestCenter} onDragEnd={(event) => handleDragEnd(event, 'sorting')}>
            <SortableContext items={(answers.items || exercise.data.code_lines).map((item: string) => item)} strategy={verticalListSortingStrategy}>
              <div className={styles.droppable}>
                {(answers.items || exercise.data.code_lines).map((item: string) => (
                  <Draggable key={item} id={item}>
                    {item}
                  </Draggable>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Button
            className="mt-6 bg-[#22c55e] text-white px-4 py-2 rounded hover:bg-[#16a34a]"
            onClick={() => handleSubmit(answers.items || exercise.data.code_lines)}
          >
            Submit
          </Button>
          {feedback && (
            <p
              className={`${styles.feedback} ${
                feedback.includes('Benar') ? styles.feedbackCorrect : styles.feedbackIncorrect
              }`}
            >
              {feedback.includes('Benar') ? (
                <CheckmarkCircleRegular className="mr-2" />
              ) : (
                <DismissCircleRegular className="mr-2" />
              )}
              {feedback}
            </p>
          )}
        </Card>
      );
    case 'guessing':
      return (
        <Card
          classNames={{
            base: 'w-full max-w-2xl mx-auto p-6 bg-white border-[#E8E8E8]',
          }}
        >
          <p className="text-lg font-semibold mb-4">{exercise.prompt}</p>
          <Editor
            height="100px"
            defaultLanguage="javascript"
            value={exercise.data.code}
            options={{ readOnly: true, fontSize: 14 }}
          />
          <Input
            classNames={{
              base: 'mt-4',
              input: 'text-sm',
              inputWrapper: 'py-2 px-3 border-[#E8E8E8]',
            }}
            placeholder="Masukkan output"
            onChange={(e) => setAnswers({ answer: e.target.value })}
          />
          <Button
            className="mt-6 bg-[#22c55e] text-white px-4 py-2 rounded hover:bg-[#16a34a]"
            onClick={() => handleSubmit(answers.answer)}
          >
            Submit
          </Button>
          {feedback && (
            <p
              className={`${styles.feedback} ${
                feedback.includes('Benar') ? styles.feedbackCorrect : styles.feedbackIncorrect
              }`}
            >
              {feedback.includes('Benar') ? (
                <CheckmarkCircleRegular className="mr-2" />
              ) : (
                <DismissCircleRegular className="mr-2" />
              )}
              {feedback}
            </p>
          )}
        </Card>
      );
    case 'multiple_choice':
      return (
        <Card
          classNames={{
            base: 'w-full max-w-2xl mx-auto p-6 bg-white border-[#E8E8E8]',
          }}
        >
          <p className="text-lg font-semibold mb-4">{exercise.data.question}</p>
          <RadioGroup
            className={styles.radioGroup}
            onChange={(e, data) => setAnswers({ answer: data.value })}
          >
            {exercise.data.options.map((opt: string) => (
              <Radio key={opt} value={opt} label={opt} />
            ))}
          </RadioGroup>
          <Button
            className='mt-6 bg-[#22c55e] text-white px-4 py-2 rounded hover:bg-[#16a34a]'
            onClick={() => handleSubmit(answers.answer)}
          >
            Submit
          </Button>
          {feedback && (
            <p
              className={`${styles.feedback} ${
                feedback.includes('Benar') ? styles.feedbackCorrect : styles.feedbackIncorrect
              }`}
            >
              {feedback.includes('Benar') ? (
                <CheckmarkCircleRegular className="mr-2" />
              ) : (
                <DismissCircleRegular className="mr-2" />
              )}
              {feedback}
            </p>
          )}
        </Card>
      );
    default:
      return <div>Tipe tidak didukung</div>;
  }
}