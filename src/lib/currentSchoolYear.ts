let currentSchoolyear: number = null;

export default function currentSchoolYear() {
  if (currentSchoolyear === null) {
    const now = new Date();
    currentSchoolyear =
      now.getMonth() > 6 ? now.getFullYear() + 1 : now.getFullYear();
  }
  return currentSchoolyear;
}
