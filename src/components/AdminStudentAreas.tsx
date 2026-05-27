import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, X, Search, GraduationCap, Video, FileText, Play, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logActivity } from '@/lib/activity-log';

interface Student {
  id: string;
  nome: string;
  email: string;
  plano: string;
}

interface StudentArea {
  id: string;
  user_id: string;
  content: {
    lessons: Lesson[];
    welcomeMessage?: string;
    completed_ids?: string[];
  };
}

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  transcriptionUrl?: string;
}

export default function AdminStudentAreas() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentArea, setStudentArea] = useState<StudentArea | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson; index: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, email, plano')
      .eq('plano', 'Max')
      .order('nome');
    
    if (error) {
      toast({ title: 'Erro ao buscar mentorados', description: error.message, variant: 'destructive' });
    } else {
      setStudents((data || []) as Student[]);
    }
    setLoading(false);
  };

  const fetchStudentArea = async (studentId: string, studentNome?: string) => {
    const { data, error } = await supabase
      .from('student_areas')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    if (error) {
      toast({ title: 'Erro ao buscar área do mentorado', description: error.message, variant: 'destructive' });
      return;
    }

    if (data) {
      setStudentArea({
        ...data,
        content: (data.content as any) as StudentArea['content']
      });
    } else {
      setStudentArea({
        id: '',
        user_id: studentId,
        content: {
          lessons: [],
          welcomeMessage: `Bem-vindo à sua mentoria personalizada, ${studentNome || selectedStudent?.nome || 'Membro'}!`
        }
      });
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    fetchStudentArea(student.id, student.nome);
  };

  const saveStudentArea = async () => {
    if (!selectedStudent || !studentArea) return;
    setIsSaving(true);

    const payload = {
      user_id: selectedStudent.id,
      content: studentArea.content as any
    };

    let error;
    if (studentArea.id) {
      const { error: err } = await supabase
        .from('student_areas')
        .update(payload)
        .eq('id', studentArea.id);
      error = err;
    } else {
      const { data, error: err } = await supabase
        .from('student_areas')
        .insert(payload)
        .select()
        .single();
      if (data) {
        setStudentArea({
          ...data,
          content: (data.content as any) as StudentArea['content']
        });
      }
      error = err;
    }

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Área do mentorado salva com sucesso!' });
      void logActivity({
        action: 'update',
        entity_type: 'student_area',
        entity_id: selectedStudent.id,
        entity_label: `Área de ${selectedStudent.nome}`,
      });
    }
    setIsSaving(false);
  };

  const addLesson = () => {
    if (!studentArea) return;
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: 'Nova Aula',
      videoUrl: '',
      duration: '00:00',
    };
    
    setStudentArea({
      ...studentArea,
      content: {
        ...studentArea.content,
        lessons: [...(studentArea.content.lessons || []), newLesson]
      }
    });
    
    setEditingLesson({ lesson: newLesson, index: (studentArea.content.lessons || []).length });
  };

  const updateLesson = (index: number, updatedLesson: Lesson) => {
    if (!studentArea) return;
    const newLessons = [...studentArea.content.lessons];
    newLessons[index] = updatedLesson;
    setStudentArea({
      ...studentArea,
      content: { ...studentArea.content, lessons: newLessons }
    });
  };

  const removeLesson = (index: number) => {
    if (!studentArea) return;
    if (!confirm('Deseja realmente remover esta aula?')) return;
    const newLessons = studentArea.content.lessons.filter((_, i) => i !== index);
    setStudentArea({
      ...studentArea,
      content: { ...studentArea.content, lessons: newLessons }
    });
  };

  const filteredStudents = students.filter(s => 
    s.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p className="text-white/40">Carregando mentorados Max...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-80 space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Buscar mentorado..." 
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/20"
            />
          </div>
          
          <div className="bg-navy border border-white/5 rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <p className="p-4 text-center text-xs text-white/20">Nenhum aluno Max encontrado.</p>
            ) : (
              filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className={`w-full text-left p-4 transition-colors border-b border-white/[0.03] last:border-0 ${selectedStudent?.id === student.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <div className="text-sm font-medium text-white">{student.nome}</div>
                  <div className="text-[10px] text-white/30 truncate">{student.email}</div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1">
          {selectedStudent ? (
            <div className="space-y-6">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif-display text-white">Editando Área de {selectedStudent.nome}</h2>
                  <p className="text-[11px] text-white/40 uppercase tracking-widest">Plano: {selectedStudent.plano}</p>
                </div>
                <button 
                  onClick={saveStudentArea} 
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  <Save size={14} />
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </header>

              <div className="glass-smooth border border-white/5 rounded-[2rem] p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Mensagem de Boas-vindas</label>
                  <textarea 
                    value={studentArea?.content.welcomeMessage || ''} 
                    onChange={e => setStudentArea(prev => prev ? { ...prev, content: { ...prev.content, welcomeMessage: e.target.value } } : null)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-white/10 min-h-[100px] resize-none"
                    placeholder="Olá, fulano. Aqui você encontra..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Aulas Disponíveis</label>
                    <button 
                      onClick={addLesson}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-white/70 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                    >
                      <Plus size={12} /> Adicionar Aula
                    </button>
                  </div>

                  <div className="space-y-3">
                    {studentArea?.content.lessons.length === 0 ? (
                      <div className="p-8 border border-dashed border-white/5 rounded-3xl text-center">
                        <Video className="w-8 h-8 text-white/10 mx-auto mb-3" />
                        <p className="text-xs text-white/20">Nenhuma aula personalizada adicionada.</p>
                      </div>
                    ) : (
                      studentArea?.content.lessons.map((lesson, idx) => (
                        <div key={lesson.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 group">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                                <Play size={14} className="text-white/40" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-white truncate">{lesson.title}</div>
                                <div className="text-[10px] text-white/20 truncate">{lesson.videoUrl || 'Sem URL de vídeo'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingLesson({ lesson, index: idx })}
                                className="p-2 text-white/20 hover:text-white transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => removeLesson(idx)}
                                className="p-2 text-white/20 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/5 rounded-[2rem]">
              <GraduationCap className="w-12 h-12 text-white/5 mb-6" />
              <h3 className="text-xl font-serif-display text-white/40 mb-2">Selecione um aluno Max</h3>
              <p className="text-[11px] text-white/20 max-w-xs uppercase tracking-widest">Escolha um aluno na lista ao lado para personalizar sua área de aulas.</p>
            </div>
          )}
        </div>
      </div>

      {editingLesson && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-navy border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-serif-display text-white">Editar Aula</h3>
              <button onClick={() => setEditingLesson(null)} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Título da Aula</label>
                <input 
                  value={editingLesson.lesson.title} 
                  onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, title: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/5 text-white focus:outline-none focus:border-white/20 transition-all"
                  placeholder="Ex: Estratégia de Escala"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">URL do Vídeo (YouTube/Vimeo)</label>
                <input 
                  value={editingLesson.lesson.videoUrl} 
                  onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, videoUrl: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/5 text-white focus:outline-none focus:border-white/20 transition-all"
                  placeholder="https://www.youtube.com/embed/..."
                />
                <p className="text-[9px] text-white/20 mt-1">Dica: Use links de 'embed' para melhor visualização.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Duração</label>
                  <input 
                    value={editingLesson.lesson.duration} 
                    onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, duration: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/5 text-white focus:outline-none focus:border-white/20 transition-all"
                    placeholder="15:30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Link Transcrição (PDF)</label>
                  <input 
                    value={editingLesson.lesson.transcriptionUrl} 
                    onChange={e => setEditingLesson({ ...editingLesson, lesson: { ...editingLesson.lesson, transcriptionUrl: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/5 text-white focus:outline-none focus:border-white/20 transition-all"
                    placeholder="#"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end mt-12">
              <button 
                onClick={() => setEditingLesson(null)} 
                className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  updateLesson(editingLesson.index, editingLesson.lesson);
                  setEditingLesson(null);
                }} 
                className="px-8 py-2.5 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
