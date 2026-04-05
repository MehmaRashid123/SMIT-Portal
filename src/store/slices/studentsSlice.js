import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

export const fetchStudents = createAsyncThunk('students/fetch', async (_, { rejectWithValue }) => {
  const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false })
  if (error) return rejectWithValue(error.message)
  return data
})

export const uploadStudents = createAsyncThunk('students/upload', async (students, { rejectWithValue }) => {
  const { data, error } = await supabase.from('students').upsert(students, { onConflict: 'cnic' }).select()
  if (error) return rejectWithValue(error.message)
  return data
})

const studentsSlice = createSlice({
  name: 'students',
  initialState: { list: [], loading: false, error: null },
  reducers: { clearError(state) { state.error = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (s) => { s.loading = true })
      .addCase(fetchStudents.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
      .addCase(fetchStudents.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(uploadStudents.fulfilled, (s, a) => { s.list = [...a.payload, ...s.list.filter(st => !a.payload.find(n => n.id === st.id))] })
  },
})

export const { clearError } = studentsSlice.actions
export default studentsSlice.reducer
