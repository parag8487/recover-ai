import React, { useState } from 'react'
import { Activity, Mail, Lock, User as UserIcon, LogIn } from 'lucide-react'
import axios from 'axios'
import useStore from '../store/useStore'

const Login = () => {
    const setUser = useStore(state => state.setUser)
    const register = useStore(state => state.register)
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Patient' })
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        try {
            if (isLogin) {
                const res = await axios.post('/api/auth/login', { email: formData.email, password: formData.password })
                localStorage.setItem('token', res.data.token)
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
                setUser(res.data.user)
            } else {
                await register(formData)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/8 dark:bg-primary/5 blur-[100px]" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/8 dark:bg-accent/5 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                {/* Logo + Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/15 border border-primary/20 mb-4 shadow-sm">
                        <Activity className="text-primary" size={26} />
                    </div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight">
                        RecoverAI<span className="text-primary">∞</span>
                    </h1>
                    <p className="text-text-secondary text-sm mt-1.5 font-medium">
                        {isLogin ? 'Intelligence for Post-Discharge Care' : 'Create your clinical account'}
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card p-7 shadow-xl">
                    {/* Tab switcher */}
                    <div className="flex bg-surface-raised dark:bg-surface-raised rounded-xl p-1 mb-6 border border-border">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all duration-200 ${isLogin ? 'bg-surface dark:bg-surface text-text-primary shadow-sm border border-border' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all duration-200 ${!isLogin ? 'bg-surface dark:bg-surface text-text-primary shadow-sm border border-border' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="bg-danger/8 dark:bg-danger/10 text-danger border border-danger/20 rounded-xl p-3.5 mb-5 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <i className="fa-solid fa-triangle-exclamation flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-semibold text-text-secondary block pl-0.5">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field pl-10"
                                        placeholder="Dr. Jane Smith"
                                    />
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-secondary block pl-0.5">
                                {isLogin ? 'Medical ID / Email' : 'Email Address'}
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field pl-10"
                                    placeholder="doctor@hospital.com"
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-secondary block pl-0.5">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3 rounded-xl font-bold text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <><i className="fa-solid fa-spinner animate-spin" /> Processing...</>
                            ) : isLogin ? (
                                <><LogIn size={16} /> Access Intelligence</>
                            ) : (
                                <><Activity size={16} /> Initialize Account</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-text-tertiary mt-5">
                    By continuing, you agree to our clinical data handling policy.
                </p>
            </div>
        </div>
    )
}

export default Login
