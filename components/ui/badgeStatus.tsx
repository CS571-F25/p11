export const getStatusBadge = (status: string) => {
  const baseClasses =
    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
  switch (status.toLowerCase()) {
    case "pending":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          {status}
        </span>
      );
    case "processing":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          {status}
        </span>
      );
    case "complete":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          {status}
        </span>
      );
    case "paid":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          {status}
        </span>
      );
    case "cancelled":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          {status}
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          {status}
        </span>
      );
  }
};