import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_URL } from '../api'

function PublicHub() {
    const { slug } = useParams()
    const [hub, setHub] = useState(null)
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchHub()
        trackVisit()
    }, [slug])

    const fetchHub = async () => {
        try {
            const res = await fetch(`${API_URL}/api/public/${slug}`)
            if (!res.ok) {
                throw new Error('Hub not found')
            }
            const data = await res.json()
            setHub(data.hub)
            setLinks(data.links || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const trackVisit = async () => {
        try {
            await fetch(`${API_URL}/api/analytics/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    eventType: 'visit',
                    deviceType: getDeviceType(),
                    timestamp: new Date().toISOString()
                })
            })
        } catch (e) {
            // Silent fail for analytics
        }
    }

    const trackClick = async (linkId) => {
        try {
            await fetch(`${API_URL}/api/analytics/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    linkId,
                    eventType: 'click',
                    deviceType: getDeviceType(),
                    timestamp: new Date().toISOString()
                })
            })
        } catch (e) {
            // Silent fail
        }
    }

    const getDeviceType = () => {
        const width = window.innerWidth
        if (width <= 768) return 'mobile'
        if (width <= 1024) return 'tablet'
        return 'desktop'
    }

    if (loading) {
        return (
            <div className="page flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        )
    }

    if (error || !hub) {
        return (
            <div className="page flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-muted)' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-sm">Hub Not Found</h1>
                    <p className="text-secondary mb-lg">
                        The link hub you're looking for doesn't exist.
                    </p>
                    <Link to="/" className="btn btn-primary">
                        Go Home
                    </Link>
                </div>
            </div>
        )
    }

    const themeClass = `hub-theme-${hub.theme || 'default'}`

    return (
        <div
            className={`page ${themeClass}`}
            style={{
                background: 'var(--hub-bg, var(--color-bg-primary))',
                minHeight: '100vh'
            }}
        >
            <div className="container py-2xl" style={{ maxWidth: '600px' }}>
                {/* Profile Section */}
                <div className="text-center mb-xl animate-slide-up">
                    {hub.ownerProfilePic ? (
                        <img
                            src={hub.ownerProfilePic}
                            alt={hub.title}
                            style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: 'var(--radius-full)',
                                objectFit: 'cover',
                                margin: '0 auto var(--spacing-lg)',
                                display: 'block',
                                border: '3px solid var(--hub-accent, var(--color-accent-primary))'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '96px',
                            height: '96px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-accent-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto var(--spacing-lg)',
                            color: 'var(--hub-accent, var(--color-accent-primary))'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                        </div>
                    )}
                    <h1 className="text-3xl font-bold mb-sm">{hub.title}</h1>
                    {hub.description && (
                        <p className="text-secondary">{hub.description}</p>
                    )}
                </div>

                {/* Links */}
                <div className="flex flex-col gap-md">
                    {links.length === 0 ? (
                        <p className="text-center text-tertiary py-xl">
                            No links available.
                        </p>
                    ) : (
                        links.map((link, index) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-card animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => trackClick(link.id)}
                            >
                                <div className="link-card-icon" style={{
                                    color: 'var(--hub-accent, var(--color-accent-primary))'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                </div>
                                <div className="link-card-content">
                                    <p className="link-card-title">{link.title}</p>
                                </div>
                                <span className="link-card-arrow">&rarr;</span>
                            </a>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-xl pt-xl" style={{ borderTop: '1px solid var(--color-border-secondary)' }}>
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-sm text-tertiary"
                        style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--hub-accent, var(--color-accent-primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        Made with Smart Link Hub
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default PublicHub
