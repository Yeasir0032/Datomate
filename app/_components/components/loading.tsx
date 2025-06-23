const LoadingSpinner = () => {
  return (
    <div className="absolute h-screen w-screen top-0 right-0 inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
