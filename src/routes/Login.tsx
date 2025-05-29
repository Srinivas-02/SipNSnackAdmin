import logo from '../assets/Logo.png'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../common/api'
import useAccountStore from '../store/account'
import useMenuStore from '../store/menu'
import useLocationStore from '../store/location'
import { useNavigate } from 'react-router-dom';

// Google Sign-In types
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

interface GoogleCredentialResponse {
    credential: string;
}

interface ApiError {
    response?: {
        status: number;
        data?: {
            message?: string;
        };
    };
    request?: any;
}

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
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    
    // Effect to redirect if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Load Google Sign-In script
    useEffect(() => {
        const loadGoogleScript = () => {
            if (window.google) return;
            
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleSignIn;
            document.head.appendChild(script);
        };

        const initializeGoogleSignIn = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '', // Add this to your .env file
                    callback: handleGoogleSignIn,
                    auto_select: false,
                });
            }
        };

        loadGoogleScript();
    }, []);
    
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const fetchInitialData = async () => {
        try {
            // Get locations data
            const locationResponse = await api.get('/locations/');
            setLocations(locationResponse.data);
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
            
        } catch (error: any) {
            setIsLoading(false);
            
            const apiError = error as ApiError;
            if (apiError.response) {
                if (apiError.response.status === 401) {
                    setError('Invalid email or password');
                } else if (apiError.response.data?.message) {
                    setError(apiError.response.data.message);
                } else {
                    setError(`Login failed: ${apiError.response.status}`);
                }
            } else if (apiError.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    const handleGoogleSignIn = async (response: GoogleCredentialResponse) => {
        try {
            setIsGoogleLoading(true);
            setError('');

            // Send the Google token to your backend
            const backendResponse = await api.post('/accounts/google-login/', {
                token: response.credential
            });

            // Save authentication details
            setDetails(backendResponse.data);

            // Fetch initial data needed for the dashboard
            const success = await fetchInitialData();

            if (!success) {
                setError('Error loading dashboard data. Please try again.');
                setIsGoogleLoading(false);
                return;
            }

            setIsGoogleLoading(false);

        } catch (error: any) {
            setIsGoogleLoading(false);
            
            const apiError = error as ApiError;
            if (apiError.response) {
                if (apiError.response.data?.message) {
                    setError(apiError.response.data.message);
                } else {
                    setError(`Google sign-in failed: ${apiError.response.status}`);
                }
            } else {
                setError('Google sign-in failed. Please try again.');
            }
        }
    };

    const handleGoogleButtonClick = () => {
        if (window.google) {
            window.google.accounts.id.prompt();
        }
    };

    return(
        <div className="min-h-screen w-full flex flex-col xl:flex-row bg-gradient-to-br from-amber-50 to-orange-100">
            {/* Logo section - responsive layout */}
            <motion.div 
                className="w-full xl:w-1/2 flex flex-col justify-center items-center 
                           px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:p-16
                           min-h-[40vh] sm:min-h-[50vh] xl:min-h-screen"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div
                    className="relative mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-20"
                    animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                    <motion.img 
                        src={logo} 
                        className="w-full mx-auto aspect-square drop-shadow-xl" 
                        alt="Sip N Snack Logo" 
                        style={{ 
                            maxWidth: 'min(240px, 60vw)', // Responsive sizing
                            filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.1))'
                        }}
                        whileHover={{ scale: 1.05 }}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6 }}
                    />
                    <motion.div
                        className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 left-1/2 transform -translate-x-1/2 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <p className="text-amber-700 italic text-sm sm:text-base md:text-lg lg:text-xl font-medium">
                            Savor every moment
                        </p>
                    </motion.div>
                </motion.div>
            </motion.div>
            
            {/* Login form section - improved responsive spacing */}
            <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12 lg:px-12 lg:py-16 xl:p-16 min-h-[60vh] xl:min-h-screen">
                <motion.div 
                    className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-md 
                               mx-auto bg-white rounded-xl shadow-2xl 
                               p-4 sm:p-6 md:p-8 lg:p-10 xl:p-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-2xl font-bold mb-1 sm:mb-2 text-gray-800">
                            Welcome Back
                        </h2>
                        <p className="mb-4 sm:mb-6 text-xs sm:text-sm md:text-base text-gray-600">
                            Sign in to your dashboard
                        </p>
                    </motion.div>

                    {/* Google Sign-In Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="mb-4 sm:mb-6"
                    >
                        <button
                            type="button"
                            onClick={handleGoogleButtonClick}
                            disabled={isGoogleLoading}
                            className="w-full flex items-center justify-center gap-2 sm:gap-3 
                                      py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 
                                      border border-gray-300 rounded-lg hover:bg-gray-50 
                                      transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed
                                      focus:ring-2 focus:ring-blue-500 focus:outline-none 
                                      min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                        >
                            {isGoogleLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" className="sm:w-5 sm:h-5">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            )}
                            <span className="text-gray-700 font-medium text-sm sm:text-base">
                                {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                            </span>
                        </button>
                    </motion.div>

                    {/* Divider */}
                    <motion.div 
                        className="relative mb-4 sm:mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.75 }}
                    >
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-xs sm:text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        onSubmit={handleLogin}
                        className="space-y-3 sm:space-y-4"
                    >
                        {/* Email field */}
                        <div>
                            <label 
                                htmlFor="email" 
                                className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-700"
                            >
                                Email
                            </label>
                            <input 
                                id="email"
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='Enter your email' 
                                className="w-full p-2.5 sm:p-3 md:p-4 border border-gray-300 rounded-lg 
                                          text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                                          transition-all duration-200 bg-white min-h-[44px] sm:min-h-[48px]"
                                style={{ fontSize: '16px' }} // Prevents zoom on iOS
                            />
                        </div>
                        
                        {/* Password field */}
                        <div>
                            <label 
                                htmlFor="password" 
                                className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-700"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input 
                                    id="password"
                                    type={passwordVisible ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password" 
                                    className="w-full p-2.5 sm:p-3 md:p-4 pr-12 sm:pr-14 border border-gray-300 rounded-lg 
                                              text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                                              transition-all duration-200 bg-white min-h-[44px] sm:min-h-[48px]"
                                    style={{ fontSize: '16px' }} // Prevents zoom on iOS
                                />
                                <button 
                                    type="button" 
                                    onClick={togglePasswordVisibility} 
                                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 
                                              text-gray-500 hover:text-orange-600 transition-colors
                                              p-1 min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] 
                                              flex items-center justify-center"
                                >
                                    <span className="text-xs sm:text-sm font-medium">
                                        {passwordVisible ? 'Hide' : 'Show'}
                                    </span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Remember me and forgot password */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 pt-1 sm:pt-2">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-gray-300 rounded text-orange-600 
                                              focus:ring-orange-500 focus:ring-2"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                />
                                <span className="ml-2 text-xs sm:text-sm text-gray-600">Remember me</span>
                            </label>
                            <button 
                                type="button"
                                className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 hover:underline 
                                          transition-colors self-start sm:self-auto"
                            >
                                Forgot password?
                            </button>
                        </div>
                        
                        {/* Submit button */}
                        <motion.button 
                            type="submit"
                            className="w-full py-2.5 sm:py-3 md:py-4 px-4 rounded-lg font-medium shadow-md 
                                      transition-all duration-300 text-white text-sm sm:text-base
                                      bg-gradient-to-r from-orange-500 to-amber-500
                                      hover:from-orange-600 hover:to-amber-600
                                      active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                                      focus:ring-4 focus:ring-orange-200 focus:outline-none
                                      min-h-[44px] sm:min-h-[48px] md:min-h-[52px] mt-4 sm:mt-6"
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>
                    </motion.form>
                    
                    {/* Error message */}
                    {error && (
                        <motion.div 
                            className="mt-3 sm:mt-4 p-2.5 sm:p-3 text-xs sm:text-sm text-red-800 bg-red-100 border border-red-200 
                                      rounded-lg"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {error}
                        </motion.div>
                    )}
                    
                    {/* Contact admin */}
                    <motion.div 
                        className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        Need access?{' '}
                        <button className="text-orange-600 hover:text-orange-700 hover:underline 
                                         transition-colors font-medium">
                            Contact administrator
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

export default Login