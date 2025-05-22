import logo from '../assets/Logo.png'
import { useState, useEffect ,useRef} from 'react';
import { motion } from 'framer-motion';
import api from '../common/api'
import useAccountStore from '../store/account'
import useMenuStore from '../store/menu'
import useLocationStore from '../store/location'
import { useNavigate } from 'react-router-dom';


const CLIENT_ID = '446831322561-oiij4g360mpf1ams94sh41c9iks52c7b.apps.googleusercontent.com';

const Login = () => {
    const { setDetails, isAuthenticated } = useAccountStore();
    const { setLocations } = useLocationStore();
    const { setCategories, setMenuItems } = useMenuStore();
    const navigate = useNavigate();
    
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const googleDivRef = useRef<HTMLDivElement>(null);




  const handleCredentialResponse = async (resp: { credential: string }) => {
  console.log('👉 Google ID Token:', resp.credential);
  setError('');
  try {
    setIsLoading(true);

    const res = await api.post('/accounts/google/login/', {
      token: resp.credential,
    });

    // save your JWTs + user data
    setDetails(res.data);

    // now fetch dashboard data and redirect as usual
    const ok = await fetchInitialData();
    if (!ok) {
      setError('Error loading dashboard data');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    // your useEffect on isAuthenticated will navigate to /dashboard

  } catch (err: any) {
    setIsLoading(false);
    console.error('Google login failed', err);
    setError(err.response?.data?.error || 'Google sign-in failed');
  }
};

  // 4️⃣ Initialize GSI and render the button once:
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.google?.accounts &&
      googleDivRef.current
    ) {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
      })
      window.google.accounts.id.renderButton(
        googleDivRef.current,
        { theme: 'outline', size: 'large', width: '100%' }
      )
      // optionally: window.google.accounts.id.prompt()
    }
  }, [])  // empty deps → run once on mount




    // Effect to redirect if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);
    
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const fetchInitialData = async () => {
        try {
            // Get locations data
            const locationResponse = await api.get('/locations/');
            setLocations(locationResponse.data); // Make sure to use .data property
            console.log(locationResponse)
            // Get menu categories
            const categoryResponse = await api.get('/menu/categories/');
            setCategories(categoryResponse.data);
            
            // Get menu items
            const menuItemResponse = await api.get('/menu/menu-items/');
            setMenuItems(menuItemResponse.data);
            
            return true;
        } catch (error) {
            console.error('Error fetching initial data:', error);
            return false;
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Reset error state
        setError('');
        
        // Simple validation
        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password');
            return;
        }
        
        try {
            setIsLoading(true);
            
            const response = await api.post('/accounts/login/', {
                email,
                password
            });
            
            // Save authentication details
            setDetails(response.data);
            
            // Fetch initial data needed for the dashboard
            const success = await fetchInitialData();
            
            if (!success) {
                setError('Error loading dashboard data. Please try again.');
                setIsLoading(false);
                return;
            }
            
            setIsLoading(false);
            
            // The navigation will now happen in the useEffect hook when isAuthenticated changes
        } catch (error: any) {
            setIsLoading(false);
            
            if (error.response) {
                // Server responded with an error
                if (error.response.status === 401) {
                    setError('Invalid email or password');
                } else if (error.response.data?.message) {
                    setError(error.response.data.message);
                } else {
                    setError(`Login failed: ${error.response.status}`);
                }
            } else if (error.request) {
                // No response received
                setError('No response from server. Please check your connection.');
            } else {
                // Other error
                setError('Login failed. Please try again.');
            }
        }
    };

    return(
        <div className="w-full h-screen flex flex-col lg:flex-row bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
            {/* Left side with logo - responsive: full width on small screens, half on large */}
            <motion.div 
                className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 md:p-8 py-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div
                    className="relative mb-16 md:mb-20"
                    animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                    <motion.img 
                        src={logo} 
                        className="w-full mx-auto aspect-1 drop-shadow-xl" 
                        alt="Sip N Snack Logo" 
                        style={{ 
                            maxWidth: 'min(400px, 90vw)',
                            filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.1))'
                        }}
                        whileHover={{ scale: 1.05 }}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6 }}
                    />
                    <motion.div
                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <p className="text-amber-700 italic text-base md:text-lg">Savor every moment</p>
                    </motion.div>
                </motion.div>
            </motion.div>
            
            {/* Right side with login form - responsive padding/sizing */}
            <div className="flex-1 flex items-center p-4 md:p-8 lg:p-12">
                <motion.div 
                    className="w-[80%] max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8"
                    style={{ 
                        boxShadow: 'var(--shadow-xl)',
                        borderRadius: 'var(--border-radius-lg)'
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <h2 className="text-2xl font-bold mb-2" 
                            style={{ color: 'var(--color-primary-dark)' }}>Welcome Back</h2>
                        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>Sign in to your dashboard</p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        onSubmit={handleLogin}
                    >
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium mb-1" 
                                   style={{ color: 'var(--color-text-primary)' }}>Email</label>
                            <input 
                                id="email"
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='Enter your email' 
                                className="w-full p-3 border rounded-lg transition-all" 
                                style={{ 
                                    borderColor: 'var(--color-border)',
                                    borderRadius: 'var(--border-radius-md)',
                                }}
                            />
                        </div>
                        
                        <div className="relative mb-6">
                            <label htmlFor="password" className="block text-sm font-medium mb-1"
                                   style={{ color: 'var(--color-text-primary)' }}>Password</label>
                            <div className="relative">
                                <input 
                                    id="password"
                                    type={passwordVisible ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password" 
                                    className="w-full p-3 border rounded-lg transition-all" 
                                    style={{ 
                                        borderColor: 'var(--color-border)',
                                        borderRadius: 'var(--border-radius-md)',
                                    }}
                                />
                                <button 
                                    type="button" 
                                    onClick={togglePasswordVisibility} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors"
                                >
                                    {passwordVisible ? 
                                        <span className="flex items-center text-sm">Hide</span> : 
                                        <span className="flex items-center text-sm">Show</span>
                                    }
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-6">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 border-gray-300 rounded"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                    style={{ accentColor: 'var(--color-primary)' }}
                                />
                                <span className="ml-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Remember me</span>
                            </label>
                            <p className="text-sm hover:underline cursor-pointer transition-colors"
                               style={{ color: 'var(--color-primary)' }}>Forgot password?</p>
                        </div>
                        
                        <motion.button 
                            type="submit"
                            className="w-full py-3 px-4 rounded-lg font-medium shadow-md transition-all duration-300 brand-gradient text-white"
                            style={{ 
                                backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                                borderRadius: 'var(--border-radius-md)',
                            }}
                            whileHover={{ scale: 1.02, boxShadow: 'var(--shadow-lg)' }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </motion.button>
                    </motion.form>
                    
                    {error && (
                        <motion.div 
                            className="mt-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {error}
                        </motion.div>
                    )}

                     <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* ← this is where GSI injects its styled button */}
        <div ref={googleDivRef} />
      </motion.div>
                    
                    <motion.div 
                        className="mt-6 text-center text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        Need access? <span className="hover:underline cursor-pointer"
                                         style={{ color: 'var(--color-primary)' }}>Contact administrator</span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
export default Login