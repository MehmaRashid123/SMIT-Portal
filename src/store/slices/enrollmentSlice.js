import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

export const fetchEnrollments = createAsyncThunk('enrollment/fetch', async (studentId, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, courses(*), teachers(name)')
    .eq('student_id', studentId)
  if (error) return rejectWithValue(error.message)
  return data
})

export const fetchAllEnrollments = createAsyncThunk('enrollment/fetchAll', async (_, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, students(name,cnic,roll_number), courses(name)')
    .order('created_at', { ascending: false })
  if (error) return rejectWithValue(error.message)
  return data
})

export const addEnrollment = createAsyncThunk('enrollment/add', async (enrollment, { rejectWithValue }) => {
  const { data, error } = await supabase.from('enrollments').insert([enrollment]).select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState: { list: [], all: [], loading: false, error: null },
  reducers: { clearError(s) { s.error = null } },
  extraReducers: (b) => {
    b.addCase(fetchEnrollments.pending,    (s)    => { s.loading = true })
     .addCase(fetchEnrollments.fulfilled,  (s, a) => { s.loading = false; s.list = a.payload })
     .addCase(fetchEnrollments.rejected,   (s, a) => { s.loading = false; s.error = a.payload })
     .addCase(fetchAllEnrollments.fulfilled,(s,a) => { s.all = a.payload })
     .addCase(addEnrollment.fulfilled,     (s, a) => { s.all.unshift(a.payload) })
  },
})
export default enrollmentSlice.reducer
