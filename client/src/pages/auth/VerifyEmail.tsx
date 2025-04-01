import { useQueryClient } from "@tanstack/react-query";
import { Formik, Form as FormikForm } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useRef, useState } from "react";
import { useVerifyOtp } from "@/api/query-hooks/auth.hooks";
import rgtPattern from "@/assets/images/RGT PATTERN 1.png";
import rgtIcon from "@/assets/images/RGT TRANSPARENT 1.png";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const navigate = useNavigate();
  const location = useLocation();
  const otpId = location.state?.otpId || "";
  const userId = location.state?.userId || "";

  const queryClient = useQueryClient();

  const { mutate, isPending } = useVerifyOtp({
    onSuccess: (data: any) => {
      console.log("Verification successful:", data);
      queryClient.invalidateQueries({ queryKey: ["user"] });

      navigate(`${data.user.role.name === "hr" ? "/hr/feed" : "/emp/feed"}`, { replace: true });
      toast({
        title: "Success",
        description: "Email verified successfully",
      });
    },
    onError: (error: any) => {
      console.log("Verification error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to verify OTP. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
      });
    },
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    if (newOtp.every((digit) => digit) && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];

    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    if (digits.length < 6) {
      inputRefs[digits.length].current?.focus();
    } else {
      inputRefs[5].current?.focus();
      handleVerify(newOtp.join(""));
    }
  };

  const handleVerify = (otpCode: string) => {
    if (otpCode.length === 6) {
      mutate({ otp: otpCode, otpId: otpId, userId: userId });
    }
  };

  const handleResendOtp = () => {
    toast({
      title: "OTP Resent",
      description: "A new OTP has been sent to your email",
    });
  };

  return (
    <div className="w-full min-h-screen overflow-hidden flex flex-col md:flex-row rounded-3xl">
      <div className="bg-white flex flex-col justify-center items-center px-4 sm:px-8 py-8 md:py-0 flex-grow order-2 md:order-1">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={rgtIcon} alt="Logo" className="h-12 md:h-auto" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Email Verification?
            </h1>
            <p className="text-gray-500 text-sm">
              we sent a reset link to your email, open it and type in the 6
              digit OTP to proceed
            </p>
          </div>

          <Formik
            initialValues={{ otp: "" }}
            validationSchema={Yup.object({})}
            onSubmit={() => {
              handleVerify(otp.join(""));
            }}
          >
            <FormikForm className="space-y-4">
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                ))}
              </div>

              <Button
                type="submit"
                className="w-full py-2 px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-md mt-6"
                disabled={isPending || otp.join("").length !== 6}
              >
                {isPending ? "Verifying..." : "Verify"}
              </Button>
            </FormikForm>
          </Formik>

          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              Didn't receive code?{" "}
              <button
                onClick={handleResendOtp}
                className="text-pink-500 hover:text-pink-600 font-medium"
              >
                Resent OTP
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-full lg:w-[675px] md:w-1/2 bg-purpleaccent2 text-center px-4 lg:px-20 pb-20 flex-col justify-center order-1 md:order-2">
        <div className="relative flex justify-end lg:mr-8 md:mr-3">
          <img
            className="absolute w-[123px] h-[128px] top-[-75px]"
            src={rgtPattern}
            alt="Pattern"
          />
          <div className="w-[81px] h-[71px] rounded-[8px] bg-rgtpurple"></div>
        </div>

        <div className="relative flex justify-center items-center h-full">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`rounded-md bg-white bg-opacity-30 ${
                  i % 3 === 1 ? "w-24 h-24" : "w-16 h-16"
                } ${i === 4 ? "w-32 h-32" : ""}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
