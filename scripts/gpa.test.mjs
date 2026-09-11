import test from "node:test";
import assert from "node:assert/strict";
import { pkuGradePoint, summarizeCourses } from "../docs/.vuepress/components/gpa.mjs";

const course = (credits, value, mode = "percent", include = true) => ({
  name: "测试课程",
  credits,
  value,
  mode,
  include,
});

test("北大连续公式：及格边界、小数与满分", () => {
  assert.equal(pkuGradePoint(0), 0);
  assert.equal(pkuGradePoint(59.9), 0);
  assert.equal(pkuGradePoint(60), 1);
  assert.equal(pkuGradePoint(80), 3.25);
  assert.equal(pkuGradePoint(90), 3.8125);
  assert.equal(pkuGradePoint(100), 4);
  for (const value of [-1, 101, NaN, Infinity]) assert.throws(() => pkuGradePoint(value), RangeError);
});

test("按学分加权，不能先平均分数再转换；计算途中不舍入", () => {
  const result = summarizeCourses([course(3, 90), course(1, 60)]);
  assert.equal(result.gpa, 3.109375);
  assert.equal(result.credits, 4);
  assert.equal(result.weightedPoints, 12.4375);
});

test("不及格百分制保留分母，P/NP 与等级、手动排除课程不进入分母", () => {
  const result = summarizeCourses([
    course(2, 100),
    course(2, 59),
    course(8, "通过", "pass"),
    course(8, "不通过", "pass"),
    course(8, "优秀", "level"),
    course(8, "普通", "level"),
    course(8, 100, "percent", false),
  ]);
  assert.equal(result.gpa, 2);
  assert.equal(result.credits, 4);
  assert.equal(result.excluded, 5);
});

test("已有绩点直接加权，支持小数学分和零绩点", () => {
  const result = summarizeCourses([course("1.5", "3.5", "point"), course(0.5, 0, "point")]);
  assert.equal(result.gpa, 2.625);
});

test("无有效课程时不显示虚假的零 GPA", () => {
  for (const courses of [[], [course(2, "通过", "pass")], [{ name: "", credits: "", value: "", mode: "percent" }]]) {
    const result = summarizeCourses(courses);
    assert.equal(result.gpa, null);
    assert.equal(result.invalid, false);
  }
});

test("不完整、越界、非法等级均阻止总 GPA；有效的零分允许计算", () => {
  for (const invalid of [
    course("", 90),
    course(0, 90),
    course(-1, 90),
    course(Infinity, 90),
    course(1, ""),
    course(1, -1),
    course(1, 101),
    course(1, NaN),
    course(1, 4.1, "point"),
    course(1, "", "pass"),
    course(1, "未知", "level"),
  ]) {
    const result = summarizeCourses([course(3, 90), invalid]);
    assert.equal(result.invalid, true);
    assert.equal(result.gpa, null);
  }
  assert.equal(summarizeCourses([course(1, 0)]).gpa, 0);
});
