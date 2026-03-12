// Logic migrated from lgashvta.py
export const calculateFleetMetrics = (cylinders: any[]) => {
  const today = new Date();
  const tenDaysFromNow = new Date();
  tenDaysFromNow.setDate(today.getDate() + 10);

  return {
    total: cylinders.length,
    urgentTesting: cylinders.filter(c => {
      const dueDate = new Date(c.Next_Test_Due);
      return dueDate <= tenDaysFromNow && dueDate >= today;
    }).length,
    damaged: cylinders.filter(c => c.Status === 'Damaged').length
  };
};