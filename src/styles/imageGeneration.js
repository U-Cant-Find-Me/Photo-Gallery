export const styleConfig = {
    container: "bg-gradient-to-b from-slate-900 to-slate-950 min-h-screen text-white p-8",
    header: "text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-inter mb-2",
    subheader: "text-slate-400 text-lg mb-8 font-poppins",
    
    panel: {
        wrapper: "bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl",
        title: "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-inter mb-1",
        subtitle: "text-slate-400 text-sm font-poppins mb-6",
    },
    
    uploadArea: {
        base: "relative flex flex-col items-center justify-center bg-slate-800/20 border-2 border-dashed rounded-xl p-8 transition-all duration-300",
        active: "border-purple-500/50 bg-purple-900/10",
        inactive: "border-slate-700/50 hover:border-slate-600/50",
    },
    
    input: {
        wrapper: "relative mt-4",
        field: "w-full bg-slate-800/30 border border-slate-700/50 rounded-xl py-3 px-4 pr-32 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 focus:outline-none transition-all",
        button: "absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-all",
    },
    
    aspectRatio: {
        wrapper: "flex flex-wrap gap-2 mb-4",
        button: {
            base: "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            active: "bg-purple-500 text-white",
            inactive: "bg-slate-800/50 text-slate-400 hover:bg-slate-800",
        },
    },
    
    actionButton: {
        primary: "w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-purple-500/10",
        secondary: "w-full bg-slate-800/50 hover:bg-slate-800/70 text-slate-300 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50",
    },
    
    result: {
        wrapper: "bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 mt-4",
        title: "text-purple-400 font-semibold mb-2",
        content: "text-slate-300 text-sm whitespace-pre-wrap",
    },
    
    grid: {
        container: "grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto",
    },
    
    error: {
        message: "text-red-400 text-sm text-center mt-4 bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20",
    },
    
    icon: {
        base: "w-5 h-5",
        large: "w-8 h-8",
    },
};