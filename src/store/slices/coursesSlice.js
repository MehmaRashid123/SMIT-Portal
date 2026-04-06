import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

export const fetchCourses = createAsyncThunk('courses/fetch', async (_, { rejectWithValue }) => {
  const { data, error } = await supabase.from('courses').select('*').order('category', { ascending: true })
  if (error) return rejectWithValue(error.message)
  return data
})

export const addCourse = createAsyncThunk('courses/add', async ({ course, imageFile }, { rejectWithValue }) => {
  let thumbnail_url = null
  if (imageFile) {
    const fname = `${Date.now()}-${imageFile.name}`
    const { error: upErr } = await supabase.storage.from('course-thumbnails').upload(fname, imageFile)
    if (!upErr) {
      const { data } = supabase.storage.from('course-thumbnails').getPublicUrl(fname)
      thumbnail_url = data.publicUrl
    }
  }
  const { data, error } = await supabase.from('courses').insert([{ ...course, thumbnail_url }]).select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

export const updateCourse = createAsyncThunk('courses/update', async ({ id, updates }, { rejectWithValue }) => {
  const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

export const applyCourse = createAsyncThunk('courses/apply', async ({ courseId, studentId, formData }, { rejectWithValue }) => {
  const { data, error } = await supabase.from('applications').insert([{ course_id: courseId, student_id: studentId, ...formData }]).select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

const coursesSlice = createSlice({
  name: 'courses',
  initialState: { list: [], loading: false, error: null },
  reducers: { clearError(state) { state.error = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (s) => { s.loading = true })
      .addCase(fetchCourses.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
      .addCase(fetchCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(addCourse.fulfilled, (s, a) => { s.list.unshift(a.payload) })
      .addCase(updateCourse.fulfilled, (s, a) => { const i = s.list.findIndex(c => c.id === a.payload.id); if (i !== -1) s.list[i] = a.payload })
  },
})

export const { clearError } = coursesSlice.actions
export default coursesSlice.reducer
