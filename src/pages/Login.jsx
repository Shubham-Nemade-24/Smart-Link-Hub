import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../App'
import { API_URL } from '../api'

function Login() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [profilePic, setProfilePic] = useState(null)
    const [profilePicPreview, setProfilePicPreview] = useState(null)
    const fileInputRef = useRef(null)

    const { login, addToast } = useApp()
    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB')
                return
            }
            setProfilePic(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfilePicPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                const res = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Something went wrong')
                login(data.user)
                addToast('Welcome back!')
                navigate('/dashboard')
            } else {
                const formData = new FormData()
                formData.append('email', email)
                formData.append('password', password)
                formData.append('name', name)
                if (profilePic) {
                    formData.append('profilePic', profilePic)
                }

                const res = await fetch(`${API_URL}/api/auth/register`, {
                    method: 'POST',
                    body: formData
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Something went wrong')
                login(data.user)
                addToast('Account created successfully!')
                navigate('/dashboard')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 'var(--spacing-md)'
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-sm mb-xl" style={{ textDecoration: 'none' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span className="text-2xl font-bold">Smart Link Hub</span>
                </Link>

                {/* Auth Card */}
                <div className="card">
                    {/* Tabs */}
                    <div className="tabs" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <button
                            className={`tab ${isLogin ? 'active' : ''}`}
                            onClick={() => { setIsLogin(true); setError('') }}
                        >
                            Log In
                        </button>
                        <button
                            className={`tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => { setIsLogin(false); setError('') }}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid var(--color-error)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-error)',
                            marginBottom: 'var(--spacing-md)',
                            fontSize: 'var(--font-size-sm)'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <>
                                {/* Profile Picture Upload */}
                                <div className="flex justify-center mb-lg">
                                    <div
                                        className="avatar-upload"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Upload profile picture"
                                    >
                                        {profilePicPreview ? (
                                            <img
                                                src={profilePicPreview}
                                                alt="Profile preview"
                                                className="avatar-upload-image"
                                            />
                                        ) : (
                                            <div className="avatar-upload-placeholder">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                    <circle cx="12" cy="13" r="4" />
                                                </svg>
                                                <span className="text-xs">Add Photo</span>
                                            </div>
                                        )}
                                        <div className="avatar-upload-overlay">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                <circle cx="12" cy="13" r="4" />
                                            </svg>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </div>
                                <p className="text-center text-tertiary text-xs mb-md" style={{ marginTop: '-0.5rem' }}>
                                    Optional — Upload a profile picture
                                </p>

                                <div className="input-group mb-md">
                                    <label className="input-label" htmlFor="name">Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        className="input"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={!isLogin}
                                    />
                                </div>
                            </>
                        )}

                        <div className="input-group mb-md">
                            <label className="input-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group mb-lg">
                            <label className="input-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="input"
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner" />
                            ) : (
                                isLogin ? 'Log In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {isLogin && (
                        <p className="text-center text-tertiary text-sm mt-lg">
                            Don't have an account?{' '}
                            <button
                                onClick={() => setIsLogin(false)}
                                className="text-accent"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Sign up
                            </button>
                        </p>
                    )}
                </div>

                <p className="text-center text-tertiary text-sm mt-lg">
                    <Link to="/">Back to home</Link>
                </p>
            </div>
        </div>
    )
}

export default Login
