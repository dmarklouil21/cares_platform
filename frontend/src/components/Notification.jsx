import { CheckCircle, XCircle, Info, CircleCheck, CircleX } from "lucide-react"; 

const iconMap = {
  success: <CircleCheck className="h-[20px] text-primary" />,
  error: <CircleX className="h-[20px] text-red-500" />,
  info: <Info className="h-[20px] text-red-500" />,
};

export default function Notification ({ message, type = "success" }) {
  if (!message) return null;
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 transition-all duration-500">
      <div className="bg-gray2 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
        {/* <img
          src="/images/logo_white_notxt.png"
          alt="Rafi Logo"
          className="h-[20px]"
        /> */}
        {/* <img
          src="/src/assets/images/login/checkmark.svg"
          className="h-[20px]"
          alt="Check Mark"
        /> */}
        {iconMap[type]}
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}