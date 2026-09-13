const $ = (id) => document.getElementById(id);
const reviewKey = document.querySelector('meta[name="review-key"]').content;
let state, imageId, modelId, shownModel, previewTimeout, target = "model", busy = false, connectionLost = false;
const ready = new Set();
const error = (message = "") => { $("error").textContent = message; $("error").hidden = !message; };
async function post(path, data) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", "X-Review-Key": reviewKey }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}
function model() { return state.models.find((m) => m.id === modelId); }
function syncButton() {
  $("approve").disabled = busy || (state.stage === "image_review" ? !imageId : state.stage === "model_review" ? !ready.has(modelId) : true);
}
function selectModel(id) {
  modelId = id;
  const item = model();
  for (const button of $("model-options").children) button.setAttribute("aria-pressed", String(button.dataset.id === id));
  $("viewer").hidden = !item;
  $("waiting").hidden = Boolean(item);
  if (!item) { clearTimeout(previewTimeout); shownModel = undefined; $("viewer").removeAttribute("src"); }
  if (item && shownModel !== id) {
    error(); clearTimeout(previewTimeout);
    shownModel = id;
    ready.delete(id);
    const params = new URLSearchParams({ entry: "/" + item.entry, kind: item.engine, id: item.id });
    $("viewer").src = `/viewer.html?${params}`;
    previewTimeout = setTimeout(() => { if (!ready.has(id)) error("Mô hình chưa tải xong. Tải lại trang hoặc yêu cầu sửa."); }, 30000);
  }
  $("downloads").replaceChildren();
  for (const file of item?.files || []) {
    const a = document.createElement("a");
    a.href = "/" + file.file; a.download = file.file.split("/").pop();
    a.textContent = file.file.endsWith(".blend") ? "Tải .blend ↓" : file.file.endsWith(".json") ? "Tải source ↓" : file.file.endsWith(".glb") ? "Tải GLB ↓" : "Tải module ↓";
    $("downloads").append(a);
  }
  syncButton();
}
function render() {
  const imageStage = !state.imageApproval;
  const done = state.stage === "accepted";
  $("title").textContent = imageStage ? "Chọn hướng hình ảnh" : done ? "Mô hình đã duyệt" : "Xem & chốt mô hình";
  $("prompt").textContent = state.prompt;
  $("status").textContent = { awaiting_images: "Chờ ảnh", image_review: "Chờ bạn chọn", building: "Đang tạo 3D", model_review: "Chờ bạn duyệt", accepted: "Đã lưu lựa chọn" }[state.stage];
  $("step-image").classList.toggle("active", imageStage);
  $("step-model").classList.toggle("active", !imageStage && !done);
  $("step-done").classList.toggle("active", done);
  $("engine-picker").hidden = !imageStage;
  $("engine").value = state.engine;
  $("workspace").hidden = imageStage;
  $("images").hidden = !imageStage;
  $("approve").hidden = done || state.stage === "building" || state.stage === "awaiting_images";
  $("approve").textContent = imageStage ? "Dùng ảnh này ↗" : "Duyệt mô hình ✓";
  $("revise").hidden = state.stage === "awaiting_images";
  const images = state.images.filter((item) => item.round === state.imageRound);
  $("empty").hidden = !imageStage || images.length > 0;
  if (!images.some((i) => i.id === imageId)) imageId = undefined;
  $("images").replaceChildren();
  for (const item of images) {
    const button = document.createElement("button"); button.type = "button"; button.className = "image-option";
    button.setAttribute("aria-pressed", String(imageId === item.id));
    button.setAttribute("aria-label", item.title);
    const img = document.createElement("img"); img.src = "/" + item.file; img.alt = item.title;
    const caption = document.createElement("span"); caption.className = "caption";
    const name = document.createElement("span"); name.textContent = item.title;
    const check = document.createElement("span"); check.className = "checkmark"; check.textContent = "✓"; check.setAttribute("aria-hidden", "true");
    caption.append(name, check); button.append(img, caption);
    button.onclick = () => { imageId = item.id; for (const child of $("images").children) child.setAttribute("aria-pressed", String(child === button)); syncButton(); };
    $("images").append(button);
  }
  if (!imageStage) {
    const reference = state.images.find((i) => i.id === state.imageApproval.id);
    $("reference-image").src = "/" + reference.file;
    const models = state.models.filter((m) => m.round === state.modelRound && m.reference === reference.sha256);
    if (!models.some((m) => m.id === modelId)) modelId = state.modelApproval?.id || models[0]?.id;
    $("model-options").replaceChildren();
    for (const item of models) {
      const button = document.createElement("button"); button.type = "button"; button.dataset.id = item.id;
      button.textContent = item.title; button.onclick = () => selectModel(item.id); $("model-options").append(button);
    }
    selectModel(modelId);
  } else {
    clearTimeout(previewTimeout); shownModel = undefined; $("viewer").removeAttribute("src");
  }
  syncButton();
}
async function refresh() {
  if (busy) return;
  try {
    const response = await fetch("/api/state");
    if (!response.ok) throw new Error("Không kết nối được studio. Hãy chạy lại lệnh serve.");
    const updated = await response.json();
    if (connectionLost) { error(); connectionLost = false; }
    if (state?.revision !== updated.revision) { state = updated; render(); }
  } catch { connectionLost = true; error("Mất kết nối Studio. Lựa chọn đã lưu vẫn được giữ nguyên."); }
}
$("approve").onclick = async () => {
  const item = state.stage === "image_review" ? state.images.find((i) => i.id === imageId) : model();
  if (!item) return;
  busy = true; syncButton(); error();
  try {
    state = await post("/api/decision", { revision: state.revision, id: item.id, sha256: item.sha256,
      action: state.stage === "image_review" ? "approve-image" : "approve-model", engine: $("engine").value });
    render();
  } catch (e) { error(e.message); } finally { busy = false; syncButton(); }
};
function revise(which) { target = which; $("revision").hidden = false; $("feedback").focus(); }
$("revise").onclick = () => revise(state.imageApproval ? "model" : "image");
$("change-reference").onclick = () => revise("image");
$("cancel-revision").onclick = () => { $("revision").hidden = true; $("feedback").value = ""; };
$("revision").onsubmit = async (event) => {
  event.preventDefault(); busy = true; syncButton(); error();
  try {
    state = await post("/api/decision", { action: "revise", revision: state.revision, target, note: $("feedback").value });
    $("revision").hidden = true; $("feedback").value = ""; render();
  } catch (e) { error(e.message); } finally { busy = false; syncButton(); }
};
window.addEventListener("message", async (event) => {
  if (event.source !== $("viewer").contentWindow || event.origin !== "null" || event.data?.id !== modelId) return;
  if (event.data.type === "model-ready") {
    clearTimeout(previewTimeout); error();
    const item = model();
    try { await post("/api/viewed", { id: item.id, sha256: item.sha256 }); ready.add(item.id); syncButton(); }
    catch (e) { error(e.message); }
  } else if (event.data.type === "model-error") {
    clearTimeout(previewTimeout);
    ready.delete(modelId); syncButton(); error("Không mở được mô hình: " + String(event.data.message).slice(0, 240));
  }
});
await refresh();
setInterval(refresh, 1200);
