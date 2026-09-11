<script setup>
import { computed, ref } from "vue";
import { gradeOptions, summarizeCourses } from "./gpa.mjs";

let nextId = 1;
const newCourse = () => ({ id: nextId++, name: "", credits: "", mode: "percent", value: "", include: true });
const courses = ref([newCourse()]);
const summary = computed(() => summarizeCourses(courses.value));
function changeMode(course) {
  course.value = "";
}
function removeCourse(index) {
  courses.value.splice(index, 1);
  if (!courses.value.length) courses.value.push(newCourse());
}
</script>

<template>
  <section class="gpa-calculator" aria-label="海大 4.0 GPA 计算器">
    <p class="gpa-intro">填完学分和成绩，GPA 会自动更新。数据只在本页计算，刷新就会清空。</p>
    <form @submit.prevent>
      <fieldset v-for="(course, index) in courses" :key="course.id" class="gpa-course">
        <legend>课程 {{ index + 1 }}</legend>
        <div class="gpa-fields">
          <label class="gpa-name">
            课程名（可选）
            <input v-model="course.name" type="text" placeholder="如：数据结构" maxlength="100" />
          </label>
          <label>
            学分
            <input v-model="course.credits" type="number" min="0" step="any" placeholder="如：3.5" />
          </label>
          <label>
            成绩类型
            <select v-model="course.mode" @change="changeMode(course)">
              <option value="percent">百分制成绩</option>
              <option value="point">已有 4.0 制绩点</option>
              <option value="pass">通过 / 不通过</option>
              <option value="level">等级成绩</option>
            </select>
          </label>
          <label>
            {{ course.mode === "point" ? "绩点（0–4）" : course.mode === "percent" ? "分数（0–100）" : "成绩等级" }}
            <select v-if="gradeOptions[course.mode]" v-model="course.value">
              <option value="" disabled>请选择</option>
              <option v-for="grade in gradeOptions[course.mode]" :key="grade" :value="grade">{{ grade }}</option>
            </select>
            <input
              v-else
              v-model="course.value"
              type="number"
              min="0"
              :max="course.mode === 'percent' ? 100 : 4"
              step="any"
              :placeholder="course.mode === 'percent' ? '如：85' : '如：3.5'"
            />
          </label>
        </div>
        <div class="gpa-row-actions">
          <label class="gpa-checkbox"><input v-model="course.include" type="checkbox" />计入 GPA</label>
          <span v-if="summary.rows[index].point !== undefined"
            >单科绩点：{{ summary.rows[index].point.toFixed(4) }}</span
          >
          <button type="button" :aria-label="`删除课程 ${index + 1}`" @click="removeCourse(index)">删除</button>
        </div>
        <p v-if="summary.rows[index].error" class="gpa-error" role="status">{{ summary.rows[index].error }}</p>
      </fieldset>
      <button type="button" class="gpa-add" @click="courses.push(newCourse())">＋ 添加课程</button>
    </form>
    <div class="gpa-result" role="status" aria-live="polite" aria-atomic="true">
      <p class="gpa-method">计算口径：海大本科生 4.0 分段制</p>
      <strong>GPA：{{ summary.gpa === null ? "—" : summary.gpa.toFixed(4) }} / 4.0000</strong>
      <p v-if="summary.invalid">还有课程没填完整，或数值超出范围，改好后就能看到总 GPA。</p>
      <p v-else-if="summary.gpa === null">还没有能计入 GPA 的课程，先填一门试试。</p>
      <p v-if="!summary.invalid">
        计入 GPA 的学分：{{ Number(summary.credits.toFixed(4)) }}；学分 × 绩点合计：{{
          summary.weightedPoints.toFixed(4)
        }}； 已排除 {{ summary.excluded }} 门。
      </p>
    </div>
    <p class="gpa-note">
      百分制成绩按学校规定四舍五入取整后换算；通过／不通过和五级制成绩也按海大对应表计入。 已有绩点请用同一种 4.0
      制。挂科的百分制课程也算在分母里，所以上面的学分不是“已修过的学分”。
      如果某门课程或教学环节不应计入你的统计范围，可以取消“计入 GPA”。
    </p>
  </section>
</template>

<style scoped>
.gpa-calculator {
  margin: 1.5rem 0;
  padding: 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text);
}
.gpa-intro {
  margin-top: 0;
}
.gpa-course {
  min-width: 0;
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.gpa-course legend {
  padding: 0 0.4rem;
  font-weight: 600;
}
.gpa-fields {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.7fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.75rem;
}
.gpa-fields label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
}
.gpa-calculator input:not([type="checkbox"]),
.gpa-calculator select {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  color: var(--vp-c-text);
  background: var(--vp-c-bg);
  font: inherit;
}
.gpa-calculator button {
  min-height: 44px;
  padding: 0.45rem 0.85rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text);
  font: inherit;
  cursor: pointer;
}
.gpa-calculator :is(input, select, button):focus-visible {
  outline: 2px solid var(--vp-c-accent);
  outline-offset: 2px;
}
.gpa-row-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}
.gpa-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
}
.gpa-result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}
.gpa-result strong {
  font-size: 1.3rem;
}
.gpa-result .gpa-method {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}
.gpa-result p {
  margin-bottom: 0;
}
.gpa-error {
  font-weight: 600;
}
.gpa-note {
  font-size: 0.9rem;
  margin-bottom: 0;
}
@media (max-width: 900px) {
  .gpa-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 480px) {
  .gpa-calculator,
  .gpa-course {
    padding: 0.75rem;
  }
  .gpa-fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
