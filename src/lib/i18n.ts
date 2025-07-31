import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Translation resources - simplified inline version
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        overview: "Overview",
        users: "Users",
        nutrition: "Food",
        workouts: "Workouts",
        programs: "Programs",
        trainers: "Trainers",
        recipes: "Recipes",
        settings: "Settings",
        help: "Help & Support",
        primeTrainer: "Prime Subscribers",
      },

      // Common
      common: {
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        search: "Search",
        filter: "Filter",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        login: "Login",
        logout: "Logout",
        email: "Email",
        password: "Password",
        systemStatus: "System Status",
        systemOperational: "All systems operational",
      },

      // Auth
      auth: {
        welcomeBack: "Welcome back",
        signInToAccount: "Sign in to your account",
        emailAddress: "Email address",
        enterEmail: "Enter your email",
        enterPassword: "Enter your password",
        forgotPassword: "Forgot your password?",
        signIn: "Sign in",
        signingIn: "Signing in...",
        loginFailed: "Login failed",
        invalidCredentials: "Invalid credentials",
      },

      // Dashboard
      dashboard: {
        title: "Dashboard",
        welcome: "Welcome to Miran Dashboard",
      },

      // Overview
      overview: {
        title: "Overview",
        subtitle: "High-level stats",
        totalUsers: "Total Users",
        activeUsers: "Active Users",
        revenue: "Revenue",
        totalFoods: "Foods",
        secondaryFoods: "Secondary Foods",
        trainers: "Trainers",
        totalWorkouts: "Total Workouts",
        recentActivity: "Recent Activity",
        addUser: "Add User",
        createWorkout: "Create Workout",
      },

      // Error messages
      error: {
        generic: "Unexpected error, please try again.",
        reload: "Reload",
      },

      // Recipes
      recipes: {
        title: "Recipes",
        search: "Search recipes...",
        noResults: "No recipes found",
        noResultsDescription:
          "Try adjusting your search terms or browse all recipes.",
        loadMore: "Load More",
        loading: "Loading recipes...",
        errorTitle: "Failed to load recipes",
        errorDescription:
          "There was an error loading the recipes. Please try again.",
        retry: "Retry",
        timeToMake: "Time to make",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        snack: "Snack",
        recipe: "recipe",
        recipes: "recipes",
        recipeDetails: "Recipe Details",
        additionalInfo: "Additional Information",
        moreDetailsComingSoon:
          "More recipe details will be available soon, including ingredients, instructions, and nutritional information.",
        instructions: "Instructions",
        instructionsPlaceholder:
          "Detailed cooking instructions will be displayed here when available from the API.",
        recipeId: "Recipe ID",
        mealType: "Meal type",
        noTimeSpecified: "Time not specified",
        minutesFormat: "{{minutes}} min",
        hoursFormat: "{{hours}}h",
        hoursMinutesFormat: "{{hours}}h {{minutes}}min",
      },
    },
  },
  ar: {
    translation: {
      // Navigation
      nav: {
        overview: "نظرة عامة",
        users: "المستخدمين",
        nutrition: "الطعام",
        workouts: "التمارين",
        programs: "البرامج",
        recipes: "الوصفات",
        trainers: "المدربين",
        primeTrainer: "المدرب المميز",
        settings: "الإعدادات",
        help: "المساعدة والدعم",
      },

      // Common
      common: {
        save: "حفظ",
        cancel: "إلغاء",
        delete: "حذف",
        edit: "تعديل",
        add: "إضافة",
        search: "بحث",
        filter: "تصفية",
        loading: "جاري التحميل...",
        error: "خطأ",
        success: "نجح",
        login: "تسجيل الدخول",
        logout: "تسجيل الخروج",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        systemStatus: "حالة النظام",
        systemOperational: "جميع الأنظمة تعمل بشكل طبيعي",
      },

      // Auth
      auth: {
        welcomeBack: "مرحباً بعودتك",
        signInToAccount: "سجل دخولك إلى حسابك",
        emailAddress: "عنوان البريد الإلكتروني",
        enterEmail: "أدخل بريدك الإلكتروني",
        enterPassword: "أدخل كلمة المرور",
        forgotPassword: "نسيت كلمة المرور؟",
        signIn: "تسجيل الدخول",
        signingIn: "جاري تسجيل الدخول...",
        loginFailed: "فشل تسجيل الدخول",
        invalidCredentials: "بيانات اعتماد غير صحيحة",
      },

      // Dashboard
      dashboard: {
        title: "لوحة التحكم",
        welcome: "مرحباً بك في لوحة تحكم ميران",
      },

      // Overview
      overview: {
        title: "نظرة عامة",
        subtitle: "إحصائيات عالية المستوى",
        totalUsers: "إجمالي المستخدمين",
        activeUsers: "المستخدمين النشطين",
        revenue: "الإيرادات",
        totalFoods: "الأطعمة",
        secondaryFoods: "الأطعمة الثانوية",
        trainers: "المدربين",
        totalWorkouts: "إجمالي التمارين",
        recentActivity: "النشاط الأخير",
        addUser: "إضافة مستخدم",
        createWorkout: "إنشاء تمرين",
      },

      // Error messages
      error: {
        generic: "خطأ غير متوقع، يرجى المحاولة مرة أخرى.",
        reload: "إعادة تحميل",
      },

      // Recipes
      recipes: {
        title: "الوصفات",
        search: "البحث في الوصفات...",
        noResults: "لم يتم العثور على وصفات",
        noResultsDescription: "جرب تعديل مصطلحات البحث أو تصفح جميع الوصفات.",
        loadMore: "تحميل المزيد",
        loading: "جاري تحميل الوصفات...",
        errorTitle: "فشل في تحميل الوصفات",
        errorDescription:
          "حدث خطأ أثناء تحميل الوصفات. يرجى المحاولة مرة أخرى.",
        retry: "إعادة المحاولة",
        timeToMake: "وقت التحضير",
        breakfast: "فطور",
        lunch: "غداء",
        dinner: "عشاء",
        snack: "وجبة خفيفة",
        recipe: "وصفة",
        recipes: "وصفات",
        recipeDetails: "تفاصيل الوصفة",
        additionalInfo: "معلومات إضافية",
        moreDetailsComingSoon:
          "ستتوفر المزيد من تفاصيل الوصفة قريباً، بما في ذلك المكونات والتعليمات والمعلومات الغذائية.",
        instructions: "التعليمات",
        instructionsPlaceholder:
          "ستظهر هنا تعليمات الطبخ المفصلة عندما تكون متاحة من الواجهة البرمجية.",
        recipeId: "رقم الوصفة",
        mealType: "نوع الوجبة",
        noTimeSpecified: "لم يتم تحديد الوقت",
        minutesFormat: "{{minutes}} دقيقة",
        hoursFormat: "{{hours}} ساعة",
        hoursMinutesFormat: "{{hours}} ساعة {{minutes}} دقيقة",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  fallbackLng: "en",

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  // Enable debug mode in development
  debug: import.meta.env.DEV,

  // React specific options
  react: {
    useSuspense: false,
  },
});

export default i18n;
