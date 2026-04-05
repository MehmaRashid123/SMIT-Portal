import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

export const loginAdmin = createAsyncThunk('auth/loginAdmin', async ({ username, password }, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single()
  if (error || !data) return rejectWithValue('Invalid credentials')
  return { ...data, role: 'admin' }
})

export const loginStudent = createAsyncThunk('auth/loginStudent', async ({ cnic, rollNumber, password }, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('cnic', cnic)
    .eq('roll_number', rollNumber)
    .eq('password', password)
    .single()
  if (error || !data) return rejectWithValue('Invalid credentials')
  return { ...data, role: 'student' }
})

export const signupStudent = createAsyncThunk('auth/signupStudent', async ({ cnic, rollNumber, password }, { rejectWithValue }) => {
  // Check if student exists in pre-approved list
  const { data: existing, error: checkErr } = await supabase
    .from('students')
    .select('*')
    .eq('cnic', cnic)
    .eq('roll_number', rollNumber)
    .single()
  if (checkErr || !existing) return rejectWithValue('You are not registered. Contact admin.')
  if (existing.password) return rejectWithValue('Account already exists. Please login.')
  const { data, error } = await supabase
    .from('students')
    .update({ password })
    .eq('id', existing.id)
    .select()
    .single()
  if (error) return rejectWithValue(error.message)
  return { ...data, role: 'student' }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, role: null, loading: false, error: null },
  reducers: {
    logout(state) { state.user = null; state.role = null },
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const fulfilled = (state, action) => { state.loading = false; state.user = action.payload; state.role = action.payload.role }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }
    builder
      .addCase(loginAdmin.pending, pending).addCase(loginAdmin.fulfilled, fulfilled).addCase(loginAdmin.rejected, rejected)
      .addCase(loginStudent.pending, pending).addCase(loginStudent.fulfilled, fulfilled).addCase(loginStudent.rejected, rejected)
      .addCase(signupStudent.pending, pending).addCase(signupStudent.fulfilled, fulfilled).addCase(signupStudent.rejected, rejected)
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
