import { Field, FieldInputProps, Formik, Form as FormikForm } from 'formik';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useState } from 'react';
import { useSetPassword } from '@/api/query-hooks/auth.hooks';
import rgtPattern from '@/assets/images/RGT PATTERN 1.png';
import rgtIcon from '@/assets/images/RGT TRANSPARENT 1.png';
import envato from '@/assets/images/envato-labs-image-edit (5) 2.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface FormValues {
  password: string;
  confirmPassword: string;
}

const CreatePasswordSchema = Yup.object({
  password: Yup.string().min(8, 'Password must be at least 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match'),
});

const CreatePassword = () => {
  const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  const { mutate, isPending } = useSetPassword({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Login successful',
      });
      navigate('/emp/feed');
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
    confirmPassword: '',
    password: '',
  };

  const handleSubmit = (values: FormValues) => {
    mutate(values);
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
              You’re Almost there
            </h1>
            <p className="text-gray-500 text-sm">
              now you need to create a password
            </p>
          </div>

          <Formik
            initialValues={initialFormValues}
            validationSchema={CreatePasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <FormikForm className="space-y-4">

                <div className="space-y-3 flex flex-col">
                  <div className="flex justify-between">
                    <label htmlFor="password" className="text-sm font-bold">
                      Password
                    </label>
                  </div>
                  <Field name="password">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <div>
                        <div className="relative">
                          <Input
                            id="password"
                            type={isPasswordVisible ? 'text' : 'password'}
                            placeholder="••••••"
                            {...field}
                            className={`w-full py-2 px-4 ${
                              touched.password && errors.password
                                ? 'border-red-500'
                                : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPasswordVisible((currentVal) => !currentVal)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {isPasswordVisible ? (
                              <Eye className="h-5 w-5 text-gray-500" />
                            ) : (
                              <EyeOff className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                        {touched.password && errors.password && (
                          <div className="text-red-500 text-sm mt-1">
                            {errors.password}
                          </div>
                        )}
                      </div>
                    )}
                  </Field>
                              </div>
                              
                               <div className="space-y-3 flex flex-col">
                  <div className="flex justify-between">
                    <label htmlFor="confirmPassword" className="text-sm font-bold">
                     Confirm Password
                    </label>
                  </div>
                  <Field name="confirmPassword">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <div>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={isPasswordVisible ? 'text' : 'password'}
                            placeholder="••••••"
                            {...field}
                            className={`w-full py-2 px-4 ${
                              touched.confirmPassword && errors.confirmPassword
                                ? 'border-red-500'
                                : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPasswordVisible((currentVal) => !currentVal)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {isPasswordVisible ? (
                              <Eye className="h-5 w-5 text-gray-500" />
                            ) : (
                              <EyeOff className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                        {touched.confirmPassword && errors.confirmPassword && (
                          <div className="text-red-500 text-sm mt-1">
                            {errors.confirmPassword}
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
                  {isPending ? 'Creating Password ....' : 'Create Password'}
                </Button>
              </FormikForm>
            )}
          </Formik>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Pattern and Image - Hidden on mobile */}
      <div className="hidden md:flex w-full lg:w-[675px] md:w-1/2 bg-purpleaccent2 text-center px-4 lg:px-20 pb-20 flex-col justify-center order-1 md:order-2">
        <div className="relative flex justify-end lg:mr-8 md:mr-3">
          <img
            className="absolute w-[123px] h-[128px] top-[-75px]"
            src={rgtPattern}
            alt="Pattern"
          />
          <div className="w-[81px] h-[71px] rounded-[8px] bg-rgtpurple"></div>
        </div>

        <div className="relative mt-2 md:mt-0 mx-auto">
          <div className="bg-rgtpurpleaccent2 lg:w-[294px] lg:h-[342px] md:w-[260px] md:h-[320px] rounded-t-[426px]"></div>
          <div className="w-full lg:w-[800px] md:w-[700px] absolute lg:top-[-150px] md:top-[-173px] md:left-[300px]  lg:left-[380px] -translate-x-1/2">
            <img src={envato} className="max-w-full h-auto " alt="Envato" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;