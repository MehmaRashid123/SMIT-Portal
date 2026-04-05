import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

export const fetchLeaves = createAsyncThunk('leaves/fetch', async (studentId, { rejectWithValue }) => {
  let query = supabase.from('leaves').select('*, students(name, roll_number)').order('created_at', { ascending: false })
  if (studentId) query = query.eq('student_id', studentId)
  const { data, error } = await query
  if (error) return rejectWithValue(error.message)
  return data
})

export const submitLeave = createAsyncThunk('leaves/submit', async ({ studentId, reason, fromDate, toDate, imageFile }, { rejectWithValue }) => {
  let imageUrl = null
  if (imageFile) {
    const fileName = `${Date.now()}-${imageFile.name}`
    const { error: uploadErr } = await supabase.storage.from('leave-attachments').upload(fileName, imageFile)
    if (uploadErr) return rejectWithValue(uploadErr.message)
    const { data: urlData } = supabase.storage.from('leave-attachments').getPublicUrl(fileName)
    imageUrl = urlData.publicUrl
  }
  const { data, error } = await supabase.from('leaves').insert([{ student_id: studentId, reason, from_date: fromDate, to_date: toDate, image_url: imageUrl, status: 'pending' }]).select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

export const updateLeaveStatus = createAsyncThunk('leaves/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  const { data, error } = await supabase.from('leaves').update({ status }).eq('id', id).select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

const leavesSlice = createSlice({
  name: 'leaves',
  initialState: { list: [], loading: false, error: null },
  reducers: { clearError(state) { state.error = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (s) => { s.loading = true })
      .addCase(fetchLeaves.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
      .addCase(fetchLeaves.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(submitLeave.fulfilled, (s, a) => { s.list.unshift(a.payload) })
      .addCase(updateLeaveStatus.fulfilled, (s, a) => { const i = s.list.findIndex(l => l.id === a.payload.id); if (i !== -1) s.list[i] = a.payload })
  },
})

export const { clearError } = leavesSlice.actions
export default leavesSlice.reducer
