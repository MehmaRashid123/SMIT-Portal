import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

export const fetchCourses = createAsyncThunk('courses/fetch', async (_, { rejectWithValue }) => {
  const { data, error } = await supabase.from('courses').select('*').order('category', { ascending: true })
  if (error) return rejectWithValue(error.message)
  return data
})

const uploadThumbnail = async (imageFile) => {
  const ext   = imageFile.name.split('.').pop()
  const fname = `course-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('course-thumbnails')
    .upload(fname, imageFile, { cacheControl: '3600', upsert: false })
  if (error) { console.error('Thumbnail upload error:', error.message); return null }
  const { data } = supabase.storage.from('course-thumbnails').getPublicUrl(fname)
  return data.publicUrl
}

export const addCourse = createAsyncThunk('courses/add', async ({ course, imageFile }, { rejectWithValue }) => {
  let thumbnail_url = null
  if (imageFile) thumbnail_url = await uploadThumbnail(imageFile)
  const { data, error } = await supabase.from('courses').insert([{ ...course, thumbnail_url }]).select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

export const updateCourse = createAsyncThunk('courses/update', async ({ id, updates, imageFile }, { rejectWithValue }) => {
  if (imageFile) {
    const url = await uploadThumbnail(imageFile)
    if (url) updates.thumbnail_url = url
  }
  const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

export const deleteCourse = createAsyncThunk('courses/delete', async (id, { rejectWithValue }) => {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) return rejectWithValue(error.message)
  return id
})

const coursesSlice = createSlice({
  name: 'courses',
  initialState: { list: [], loading: false, error: null },
  reducers: { clearError(state) { state.error = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending,   (s)    => { s.loading = true })
      .addCase(fetchCourses.fulfilled, (s, a) => { s.loading = false; s.list = a.payload })
      .addCase(fetchCourses.rejected,  (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(addCourse.fulfilled,    (s, a) => { s.list.unshift(a.payload) })
      .addCase(updateCourse.fulfilled, (s, a) => {
        const i = s.list.findIndex(c => c.id === a.payload.id)
        if (i !== -1) s.list[i] = a.payload
      })
      .addCase(deleteCourse.fulfilled, (s, a) => {
        s.list = s.list.filter(c => c.id !== a.payload)
      })
  },
})

export const { clearError } = coursesSlice.actions
export default coursesSlice.reducer
