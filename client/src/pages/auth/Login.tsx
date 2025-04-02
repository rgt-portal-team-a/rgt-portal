import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Field, Form as FormikForm, Formik, FieldInputProps } from "formik";
import { useLogin } from '@/api/query-hooks/auth.hooks';
import { toast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleAuthButton } from "@/components/Login/GoogleAuthButton";
import rgtIcon from "@/assets/images/RGT TRANSPARENT 1.png";
import rgtpatternimg1 from "@/assets/images/rgtpatternimg1.svg";
import loginMainImg from "@/assets/images/WomanAndBackground.png";

interface FormValues {
  email: string;
  password: string;
}

const LoginSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
});

const Login = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending } = useLogin({
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (data.requiresOtp) {
        navigate('/verify-email', { state: { email: data.message, otpId: data.otpId, userId: data.userId } });
      }
      else {
        navigate('/emp/feed', { replace: true });
        toast({
          title: 'Success',
          description: 'Login successful',
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to login. Please check your credentials.';

      toast({
        title: 'Error',
        description: errorMessage,
      });
    },
  });

  const initialFormValues = {
    email: '',
    password: '',
  };

  const handleSubmit = (values: FormValues) => {
    mutate({
      email: values.email,
      password: values.email,
    });
  };

  return (
    <div className="w-full min-h-screen overflow-hidden flex flex-col md:flex-row rounded-3xl">
      {/* Left Side: Login Form */}
      <div className="bg-white flex flex-col justify-center items-center px-4 sm:px-8 py-8 md:py-0 flex-grow order-2 md:order-1">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={rgtIcon} alt="Logo" className="h-12 md:h-auto" />
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm">
              get into your account to begin.
            </p>
          </div>

          <Formik
            initialValues={initialFormValues}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <FormikForm className="space-y-4">
                <div className="space-y-3 flex flex-col">
                  <label htmlFor="email" className="text-sm font-bold">
                    Email address
                  </label>
                  <Field name="email">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <div>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          className={`w-full py-2 px-4 border border-gray-300 rounded-md ${
                            touched.email && errors.email
                              ? 'border-red-500'
                              : ''
                          }`}
                        />
                        {touched.email && errors.email && (
                          <div className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </div>
                        )}
                      </div>
                    )}
                  </Field>
                </div>

                <Button
                  type="submit"
                  className="w-full py-2 px-4 bg-rgtpink hover:bg-pink-500 text-white rounded-md"
                  disabled={isPending}
                >
                  {isPending ? 'Signing in...' : 'Sign in'}
                </Button>
              </FormikForm>
            )}
          </Formik>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Google Sign In */}
          <GoogleAuthButton />
        </div>
      </div>

      {/* Right Side: Pattern and Image - Hidden on mobile */}
      <div className="hidden px-auto md:flex w-full  md:w-1/2 lg:w-1/2  xl:w-1/2 2xl:w-1/2 bg-purpleaccent2 text-center pb-20 flex-col justify-center order-1 md:order-2">
            <div className="relative  flex justify-center h-fit ">
              <img 
                src={loginMainImg} 
                alt="MainLogin Image"
                className="xl:scale-130"
              />
              <img 
                src={rgtpatternimg1}
                className="absolute right-1/5 md:right-1/8 top-0"
              />
            </div>
      </div>

    </div>
  );
};

export default Login;