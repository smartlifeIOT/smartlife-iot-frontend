const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src', 'i18n', 'locales', 'en.json');
const arPath = path.join(__dirname, 'src', 'i18n', 'locales', 'ar.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));

enData.automation = {
  title: 'Automation',
  description: 'Create automated workflows and device interactions',
  buttons: {
    create: 'Create Automation',
    cancel: 'Cancel',
    save: 'Save Changes',
    duplicate: 'Duplicate',
    delete: 'Delete',
    edit: 'Edit',
    enable: 'Enable',
    disable: 'Disable',
  },
  stats: {
    total: 'Total Automations',
    totalDesc: 'Configured rules',
    active: 'Active',
    activeDesc: 'Currently running',
    executions: 'Total Executions',
    executionsDesc: 'All time',
    errors: 'Errors',
    errorsDesc: 'Need attention',
  },
  table: {
    title: 'Automation Rules',
    searchPlaceholder: 'Search automations...',
    columns: {
      name: 'Name',
      trigger: 'Trigger',
      action: 'Action',
      executions: 'Executions',
      status: 'Status',
      actions: 'Actions',
    },
    noResults: 'No automations found.',
  },
  dialog: {
    createTitle: 'Create Automation',
    editTitle: 'Edit Automation',
    description: 'Define triggers and actions for your automation',
    sections: {
      basic: 'Basic Information',
      trigger: 'Trigger (When)',
      action: 'Action (Then)',
      options: 'Options',
    },
    fields: {
      name: 'Automation Name *',
      namePlaceholder: 'e.g., Temperature Control',
      description: 'Description',
      descriptionPlaceholder: 'Describe what this automation does...',
      triggerType: 'Trigger Type *',
      device: 'Select Device *',
      attribute: 'Attribute',
      operator: 'Operator',
      value: 'Value',
      actionType: 'Action Type *',
      targetDevice: 'Target Device *',
      command: 'Command *',
      enable: 'Enable Automation',
      enableDesc: 'Start automation immediately',
      log: 'Enable Logging',
      logDesc: 'Log all executions',
    },
    options: {
      triggerType: {
        threshold: 'Device Threshold',
        state: 'Device State Change',
        schedule: 'Time Schedule',
        event: 'Custom Event',
      },
      operator: {
        greater: '> Greater than',
        less: '< Less than',
        equals: '= Equals',
        notEquals: '!= Not equals',
      },
      actionType: {
        control: 'Control Device',
        setValue: 'Set Attribute Value',
        notification: 'Send Notification',
        webhook: 'Call Webhook',
      },
      command: {
        on: 'Turn ON',
        off: 'Turn OFF',
        toggle: 'Toggle',
        custom: 'Custom Value',
      },
    },
  },
};

arData.automation = {
  title: 'الأتمتة',
  description: 'إنشاء سير عمل آلي وتفاعلات الأجهزة',
  buttons: {
    create: 'إنشاء أتمتة',
    cancel: 'إلغاء',
    save: 'حفظ التغييرات',
    duplicate: 'تكرار',
    delete: 'حذف',
    edit: 'تعديل',
    enable: 'تفعيل',
    disable: 'تعطيل',
  },
  stats: {
    total: 'إجمالي الأتمتة',
    totalDesc: 'القواعد المكونة',
    active: 'نشط',
    activeDesc: 'قيد التشغيل حالياً',
    executions: 'إجمالي التنفيذات',
    executionsDesc: 'في كل الأوقات',
    errors: 'أخطاء',
    errorsDesc: 'تحتاج للانتباه',
  },
  table: {
    title: 'قواعد الأتمتة',
    searchPlaceholder: 'البحث في الأتمتة...',
    columns: {
      name: 'الاسم',
      trigger: 'المشغل',
      action: 'الإجراء',
      executions: 'التنفيذات',
      status: 'الحالة',
      actions: 'الإجراءات',
    },
    noResults: 'لم يتم العثور على أتمتة.',
  },
  dialog: {
    createTitle: 'إنشاء أتمتة',
    editTitle: 'تعديل الأتمتة',
    description: 'تحديد المشغلات والإجراءات للأتمتة الخاصة بك',
    sections: {
      basic: 'المعلومات الأساسية',
      trigger: 'المشغل (متى)',
      action: 'الإجراء (ثم)',
      options: 'خيارات',
    },
    fields: {
      name: 'اسم الأتمتة *',
      namePlaceholder: 'مثال، التحكم في درجة الحرارة',
      description: 'الوصف',
      descriptionPlaceholder: 'صف ما تفعله هذه الأتمتة...',
      triggerType: 'نوع المشغل *',
      device: 'تحديد الجهاز *',
      attribute: 'السمة',
      operator: 'المعامل',
      value: 'القيمة',
      actionType: 'نوع الإجراء *',
      targetDevice: 'الجهاز المستهدف *',
      command: 'الأمر *',
      enable: 'تفعيل الأتمتة',
      enableDesc: 'بدء الأتمتة على الفور',
      log: 'تفعيل التسجيل',
      logDesc: 'تسجيل كافة التنفيذات',
    },
    options: {
      triggerType: {
        threshold: 'حد الجهاز',
        state: 'تغيير حالة الجهاز',
        schedule: 'جدول زمني',
        event: 'حدث مخصص',
      },
      operator: {
        greater: '> أكبر من',
        less: '< أصغر من',
        equals: '= يساوي',
        notEquals: '!= لا يساوي',
      },
      actionType: {
        control: 'التحكم في الجهاز',
        setValue: 'تعيين قيمة السمة',
        notification: 'إرسال إشعار',
        webhook: 'استدعاء Webhook',
      },
      command: {
        on: 'تشغيل',
        off: 'إيقاف',
        toggle: 'تبديل',
        custom: 'قيمة مخصصة',
      },
    },
  },
};

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));

console.log('Successfully added automation keys to translation files.');
