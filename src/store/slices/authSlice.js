import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

// ── Admin login ──
export const loginAdmin = createAsyncThunk('auth/loginAdmin', async ({ username, password }, { rejectWithValue }) => {
  const { data, error } = await supabase.from('admins').select('*').eq('username', username).eq('password', password).single()
  if (error || !data) return rejectWithValue('Invalid credentials')
  return { ...data, role: 'admin' }
})

// ── Teacher login ──
export const loginTeacher = createAsyncThunk('auth/loginTeacher', async ({ username, password }, { rejectWithValue }) => {
  const { data, error } = await supabase.from('teachers').select('*').eq('username', username).eq('password', password).single()
  if (error || !data) return rejectWithValue('Invalid credentials')
  return { ...data, role: 'teacher' }
})

// ── Student login ──
export const loginStudent = createAsyncThunk('auth/loginStudent', async ({ cnic, password }, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('students').select('*').eq('cnic', cnic).eq('password', password).single()
  if (error || !data) return rejectWithValue('Invalid CNIC or password')
  return { ...data, role: 'student' }
})

// ── Student set/reset password via CNIC ──
export const setStudentPassword = createAsyncThunk('auth/setStudentPassword', async ({ cnic, newPassword }, { rejectWithValue }) => {
  const { data: student, error } = await supabase.from('students').select('*').eq('cnic', cnic).single()
  if (error || !student) return rejectWithValue('CNIC not found. Make sure your registration is approved by admin.')
  if (student.password) return rejectWithValue('Password already set. Please login instead.')
  const { data: updated, error: upErr } = await supabase.from('students').update({ password: newPassword }).eq('id', student.id).select().single()
  if (upErr) return rejectWithValue(upErr.message)
  return { ...updated, role: 'student' }
})

const pending   = (s)    => { s.loading = true;  s.error = null }
const fulfilled = (s, a) => { s.loading = false; s.user = a.payload; s.role = a.payload.role }
const rejected  = (s, a) => { s.loading = false; s.error = a.payload }

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, role: null, loading: false, error: null },
  reducers: {
    logout(state)     { state.user = null; state.role = null; state.error = null },
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending,   pending).addCase(loginAdmin.fulfilled,   fulfilled).addCase(loginAdmin.rejected,   rejected)
      .addCase(loginTeacher.pending, pending).addCase(loginTeacher.fulfilled, fulfilled).addCase(loginTeacher.rejected, rejected)
      .addCase(loginStudent.pending, pending).addCase(loginStudent.fulfilled, fulfilled).addCase(loginStudent.rejected, rejected)
      .addCase(setStudentPassword.pending, pending).addCase(setStudentPassword.fulfilled, fulfilled).addCase(setStudentPassword.rejected, rejected)
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
