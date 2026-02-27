import { Link } from 'react-router-dom'
import { useApp } from '../App'

// SVG Icon Components
const LinkIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
)

function Landing() {
    const { user } = useApp()

    return (
        <div className="page">
            {/* Navigation */}
            <nav className="navbar">
                <div className="navbar-content">
                    <Link to="/" className="navbar-logo">
                        <LinkIcon />
                        Smart Link Hub
                    </Link>
                    <div className="navbar-nav">
                        {user ? (
                            <Link to="/dashboard" className="btn btn-primary">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="navbar-link">Log In</Link>
                                <Link to="/login" className="btn btn-primary">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title animate-slide-up">
                        One Link to Rule<br />
                        <span className="hero-title-accent">All Your Links</span>
                    </h1>
                    <p className="hero-subtitle animate-fade-in">
                        Create smart link hubs that dynamically adapt based on time, device,
                        and location. Track clicks and optimize your digital presence.
                    </p>
                    <div className="hero-actions animate-fade-in">
                        <Link to={user ? "/hub/new" : "/login"} className="btn btn-primary btn-lg">
                            Create Your Hub
                        </Link>
                        <a href="#features" className="btn btn-secondary btn-lg">
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-2xl">
                <div className="container">
                    <h2 className="text-3xl font-bold text-center mb-xl">
                        Why Choose <span className="text-accent">Smart Link Hub?</span>
                    </h2>
                    <div className="grid grid-cols-3 lg:grid-cols-3">
                        <FeatureCard
                            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" /></svg>}
                            title="Smart Rules"
                            description="Show different links based on time, device, or location. Your hub adapts to your audience."
                        />
                        <FeatureCard
                            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
                            title="Real-Time Analytics"
                            description="Track every click with detailed insights. Know what works and optimize your links."
                        />
                        <FeatureCard
                            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
                            title="Lightning Fast"
                            description="Optimized for speed. Your visitors get the best experience with instant loading."
                        />
                        <FeatureCard
                            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5" /><path d="M17.5 10.5a2.5 2.5 0 0 0-5 0v.5h5v-.5z" /><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M2 12h4l2-3 3 6 2-3h4" /></svg>}
                            title="Fully Customizable"
                            description="Match your brand with custom themes, colors, and layouts. Make it yours."
                        />
                        <FeatureCard
                            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>}
                            title="Mobile First"
                            description="Beautiful on every device. Responsive design that looks great everywhere."
                        />
                        <FeatureCard
                            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 12 15 16 10" /></svg>}
                            title="Secure and Reliable"
                            description="Your data is safe with us. Enterprise-grade security for peace of mind."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-2xl" style={{ background: 'var(--color-bg-secondary)' }}>
                <div className="container">
                    <h2 className="text-3xl font-bold text-center mb-xl">
                        How It <span className="text-accent">Works</span>
                    </h2>
                    <div className="grid grid-cols-3 lg:grid-cols-3 gap-lg">
                        <StepCard
                            number="1"
                            title="Create Your Hub"
                            description="Sign up and create your first smart link hub in seconds."
                        />
                        <StepCard
                            number="2"
                            title="Add Your Links"
                            description="Add all your important links and set up smart display rules."
                        />
                        <StepCard
                            number="3"
                            title="Share and Track"
                            description="Share your unique URL and watch the analytics roll in."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-2xl">
                <div className="container text-center">
                    <h2 className="text-3xl font-bold mb-md">
                        Ready to Get Started?
                    </h2>
                    <p className="text-secondary mb-lg" style={{ maxWidth: '500px', margin: '0 auto var(--spacing-lg)' }}>
                        Join thousands of creators, businesses, and professionals who trust Smart Link Hub.
                    </p>
                    <Link to={user ? "/hub/new" : "/login"} className="btn btn-primary btn-lg">
                        Create Your Free Hub
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--color-border-secondary)',
                padding: 'var(--spacing-xl) 0'
            }}>
                <div className="container flex justify-between items-center">
                    <div className="flex items-center gap-sm">
                        <LinkIcon />
                        <span className="font-semibold">Smart Link Hub</span>
                    </div>
                    <p className="text-tertiary text-sm">
                        2024 Smart Link Hub. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="card">
            <div className="feature-icon-wrap" style={{ marginBottom: 'var(--spacing-md)' }}>
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-sm">{title}</h3>
            <p className="text-secondary">{description}</p>
        </div>
    )
}

function StepCard({ number, title, description }) {
    return (
        <div className="card text-center">
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-accent-primary)',
                color: 'var(--color-text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                margin: '0 auto var(--spacing-md)'
            }}>
                {number}
            </div>
            <h3 className="text-lg font-semibold mb-sm">{title}</h3>
            <p className="text-secondary">{description}</p>
        </div>
    )
}

export default Landing
