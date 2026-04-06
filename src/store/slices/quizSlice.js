import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

export const fetchQuizzes = createAsyncThunk('quiz/fetch', async (courseId, { rejectWithValue }) => {
  let q = supabase.from('quizzes').select('*, quiz_questions(*)').order('created_at', { ascending: false })
  if (courseId) q = q.eq('course_id', courseId)
  const { data, error } = await q
  if (error) return rejectWithValue(error.message)
  return data
})

export const addQuiz = createAsyncThunk('quiz/add', async ({ quiz, questions }, { rejectWithValue }) => {
  const { data, error } = await supabase.from('quizzes').insert([quiz]).select().single()
  if (error) return rejectWithValue(error.message)
  if (questions?.length) {
    await supabase.from('quiz_questions').insert(questions.map(q => ({ ...q, quiz_id: data.id })))
  }
  return { ...data, quiz_questions: questions || [] }
})

export const submitQuizResult = createAsyncThunk('quiz/submit', async (result, { rejectWithValue }) => {
  const { data, error } = await supabase.from('quiz_results').insert([result]).select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

const quizSlice = createSlice({
  name: 'quiz',
  initialState: { list: [], loading: false, error: null },
  reducers: { clearError(s) { s.error = null } },
  extraReducers: (b) => {
    b.addCase(fetchQuizzes.pending,  (s)    => { s.loading = true })
     .addCase(fetchQuizzes.fulfilled,(s, a) => { s.loading = false; s.list = a.payload })
     .addCase(fetchQuizzes.rejected, (s, a) => { s.loading = false; s.error = a.payload })
     .addCase(addQuiz.fulfilled,     (s, a) => { s.list.unshift(a.payload) })
  },
})
export default quizSlice.reducer
