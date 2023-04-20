import { Link } from "react-router-dom"

export default function Index() {
    return <div className="hero min-h-screen">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <h1 className="text-5xl font-bold">Create my first certificate</h1>
                <p className="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
                <Link to="/certificate/create">
                    <button className="btn btn-primary">Get Started</button>
                </Link>
                <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>
            </div>
        </div>
    </div>
}