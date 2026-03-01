import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Check, Search, Tag, Shuffle, Import } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BankQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  tags: string[];
  difficulty: string;
}

interface QuestionBankProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: Omit<BankQuestion, 'id'>[]) => void;
}

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function QuestionBank({ isOpen, onClose, onImport }: QuestionBankProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [newQ, setNewQ] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    tags: '',
    difficulty: 'medium',
  });

  useEffect(() => {
    if (isOpen) fetchQuestions();
  }, [isOpen]);

  const fetchQuestions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setQuestions(
        (data || []).map((q: any) => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          correct_answer: q.correct_answer,
          explanation: q.explanation || '',
          tags: q.tags || [],
          difficulty: q.difficulty || 'medium',
        }))
      );
    } catch {
      toast.error('Failed to load question bank');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!user || !newQ.question.trim()) return;
    const tags = newQ.tags.split(',').map(t => t.trim()).filter(Boolean);
    const options = newQ.options.filter(o => o.trim());
    if (options.length < 2) { toast.error('At least 2 options needed'); return; }

    try {
      const { error } = await supabase.from('question_bank').insert({
        instructor_id: user.id,
        question: newQ.question,
        options,
        correct_answer: newQ.correct_answer,
        explanation: newQ.explanation || null,
        tags,
        difficulty: newQ.difficulty,
      });
      if (error) throw error;
      toast.success('Question added to bank');
      setNewQ({ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '', tags: '', difficulty: 'medium' });
      setShowAdd(false);
      fetchQuestions();
    } catch {
      toast.error('Failed to add question');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('question_bank').delete().eq('id', id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      selectedIds.delete(id);
      setSelectedIds(new Set(selectedIds));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setSelectedIds(next);
  };

  const handleImportSelected = () => {
    const selected = questions.filter(q => selectedIds.has(q.id));
    onImport(selected.map(({ id, ...rest }) => rest));
    setSelectedIds(new Set());
    onClose();
  };

  const handleRandomImport = (count: number) => {
    const filtered = getFilteredQuestions();
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);
    onImport(picked.map(({ id, ...rest }) => rest));
    onClose();
  };

  const allTags = [...new Set(questions.flatMap(q => q.tags))];

  const getFilteredQuestions = () => {
    return questions.filter(q => {
      if (searchQuery && !q.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterTag && !q.tags.includes(filterTag)) return false;
      if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
      return true;
    });
  };

  const filtered = getFilteredQuestions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Bank</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="pl-9"
              />
            </div>
            <Select value={filterTag} onValueChange={v => setFilterTag(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={v => setFilterDifficulty(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1">
              <Plus className="w-4 h-4" /> Add Question
            </Button>
            <Button size="sm" variant="outline" onClick={handleImportSelected} disabled={selectedIds.size === 0} className="gap-1">
              <Import className="w-4 h-4" /> Import Selected ({selectedIds.size})
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleRandomImport(5)} disabled={filtered.length === 0} className="gap-1">
              <Shuffle className="w-4 h-4" /> Random 5
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleRandomImport(10)} disabled={filtered.length < 2} className="gap-1">
              <Shuffle className="w-4 h-4" /> Random 10
            </Button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
              <Input value={newQ.question} onChange={e => setNewQ({ ...newQ, question: e.target.value })} placeholder="Question text" />
              <div className="grid grid-cols-2 gap-2">
                {newQ.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewQ({ ...newQ, correct_answer: i })}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        newQ.correct_answer === i ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
                      }`}
                    >
                      {newQ.correct_answer === i && <Check className="w-3 h-3" />}
                    </button>
                    <Input value={opt} onChange={e => {
                      const opts = [...newQ.options];
                      opts[i] = e.target.value;
                      setNewQ({ ...newQ, options: opts });
                    }} placeholder={`Option ${i + 1}`} />
                  </div>
                ))}
              </div>
              <Textarea value={newQ.explanation} onChange={e => setNewQ({ ...newQ, explanation: e.target.value })} placeholder="Explanation (optional)" rows={2} />
              <div className="flex gap-2">
                <Input value={newQ.tags} onChange={e => setNewQ({ ...newQ, tags: e.target.value })} placeholder="Tags (comma-separated)" className="flex-1" />
                <Select value={newQ.difficulty} onValueChange={v => setNewQ({ ...newQ, difficulty: v })}>
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAdd}>Save to Bank</Button>
              </div>
            </div>
          )}

          {/* Questions list */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
              No questions found. Add some to your bank!
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(q => (
                <div
                  key={q.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedIds.has(q.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                  }`}
                  onClick={() => toggleSelect(q.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                      selectedIds.has(q.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
                    }`}>
                      {selectedIds.has(q.id) && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{q.question}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">{q.difficulty}</Badge>
                        {q.tags.map(t => (
                          <Badge key={t} variant="secondary" className="text-xs gap-1">
                            <Tag className="w-3 h-3" />{t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive shrink-0"
                      onClick={e => { e.stopPropagation(); handleDelete(q.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
