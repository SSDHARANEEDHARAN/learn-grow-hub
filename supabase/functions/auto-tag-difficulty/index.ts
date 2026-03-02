import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    // Get authorization header to identify the instructor
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Get all questions from this instructor's bank
    const { data: questions, error: qError } = await supabase
      .from('question_bank')
      .select('id, question, difficulty')
      .eq('instructor_id', user.id)

    if (qError) throw qError

    // Get all quiz questions that match bank questions (by question text)
    const questionTexts = (questions || []).map(q => q.question)
    if (questionTexts.length === 0) {
      return new Response(JSON.stringify({ updated: 0, message: 'No questions in bank' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: quizQuestions } = await supabase
      .from('quiz_questions')
      .select('id, question, correct_answer, quiz_id')
      .in('question', questionTexts)

    if (!quizQuestions?.length) {
      return new Response(JSON.stringify({ updated: 0, message: 'No matching quiz questions found with attempt data' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Get all attempts for these quizzes
    const quizIds = [...new Set(quizQuestions.map(q => q.quiz_id))]
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('quiz_id, answers')
      .in('quiz_id', quizIds)

    if (!attempts?.length) {
      return new Response(JSON.stringify({ updated: 0, message: 'No attempts found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Calculate correct rate per question
    const questionStats: Record<string, { correct: number; total: number }> = {}

    for (const qq of quizQuestions) {
      const questionKey = qq.question
      if (!questionStats[questionKey]) questionStats[questionKey] = { correct: 0, total: 0 }

      for (const attempt of attempts) {
        if (attempt.quiz_id !== qq.quiz_id || !attempt.answers) continue
        const answers = attempt.answers as Record<string, number>
        const userAnswer = answers[qq.id]
        if (userAnswer !== undefined) {
          questionStats[questionKey].total++
          if (userAnswer === qq.correct_answer) questionStats[questionKey].correct++
        }
      }
    }

    // Auto-tag difficulty based on correct rates
    let updated = 0
    const updates: { id: string; oldDifficulty: string; newDifficulty: string; correctRate: number }[] = []

    for (const q of questions || []) {
      const stats = questionStats[q.question]
      if (!stats || stats.total < 3) continue // Need at least 3 attempts

      const correctRate = stats.correct / stats.total
      let newDifficulty: string

      if (correctRate >= 0.8) newDifficulty = 'easy'
      else if (correctRate >= 0.5) newDifficulty = 'medium'
      else newDifficulty = 'hard'

      if (newDifficulty !== q.difficulty) {
        const { error } = await supabase
          .from('question_bank')
          .update({ difficulty: newDifficulty })
          .eq('id', q.id)

        if (!error) {
          updated++
          updates.push({
            id: q.id,
            oldDifficulty: q.difficulty || 'medium',
            newDifficulty,
            correctRate: Math.round(correctRate * 100),
          })
        }
      }
    }

    return new Response(
      JSON.stringify({ updated, updates, message: `Updated ${updated} question difficulty levels` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
