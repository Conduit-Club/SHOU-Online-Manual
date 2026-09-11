export const gradeOptions = {
  pass: ["通过", "不通过"],
  level: ["优秀", "良好", "中等", "及格", "不及格", "普通"],
};

export function pkuGradePoint(score) {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new RangeError("百分制成绩须在 0–100 之间");
  }
  return score < 60 ? 0 : 4 - (3 * (100 - score) ** 2) / 1600;
}

export function evaluateCourse(course) {
  const empty = (value) => value === "" || value === null || value === undefined;
  if (!course.name.trim() && empty(course.credits) && empty(course.value)) {
    return { empty: true };
  }
  const credits = Number(course.credits);
  if (empty(course.credits) || !Number.isFinite(credits) || credits <= 0) {
    return { error: "请填写大于 0 的学分。" };
  }
  if (gradeOptions[course.mode]) {
    if (!gradeOptions[course.mode].includes(course.value)) {
      return { error: "请选择成绩等级。" };
    }
    return { credits, excluded: true };
  }
  if (!["percent", "point"].includes(course.mode)) {
    return { error: "请选择有效的成绩类型。" };
  }
  const value = Number(course.value);
  const max = course.mode === "percent" ? 100 : 4;
  if (empty(course.value) || !Number.isFinite(value) || value < 0 || value > max) {
    return { error: `请填写 0–${max} 之间的${course.mode === "percent" ? "分数" : "绩点"}。` };
  }
  const point = course.mode === "percent" ? pkuGradePoint(value) : value;
  return { credits, point, excluded: !course.include };
}

export function summarizeCourses(courses) {
  const rows = courses.map(evaluateCourse);
  const invalid = rows.some((row) => row.error);
  let credits = 0;
  let weightedPoints = 0;
  let excluded = 0;
  for (const row of rows) {
    if (row.error || row.empty) continue;
    if (row.excluded) {
      excluded += 1;
      continue;
    }
    credits += row.credits;
    weightedPoints += row.credits * row.point;
  }
  return {
    rows,
    invalid,
    credits,
    weightedPoints,
    excluded,
    gpa: !invalid && credits > 0 ? weightedPoints / credits : null,
  };
}
