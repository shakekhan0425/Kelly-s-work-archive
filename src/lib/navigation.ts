// 浏览历史 / 返回上下文（客户端安全：不依赖 server-only）
// 用于在 列表 → 详情 → 返回 之间保存并恢复：来源路由、筛选、滚动位置。
// 设计为纯客户端模块，可被 client component 与 server component 共同引用。
//
// v2（修复审计问题 G）：
// - 单一 wa_return_ctx 改为「路由栈」wa_return_stack，嵌套导航（信号 → 公司 → 案例）
//   不再互相覆盖，返回时逐层弹出。
// - 返回判定不再依赖 window.history.length > 1（无法区分站外），改为「栈非空即站内导航」。

export interface ReturnContext {
  /** 来源列表路由，如 /signals */
  fromRoute: string;
  /** 返回按钮展示的归属名称，如 Market Intelligence */
  fromLabel: string;
  /** 当前所在的二级标签（如有） */
  fromTab?: string;
  /** 当前生效的筛选参数 */
  fromFilters?: Record<string, string>;
  /** 离开列表时的滚动位置 */
  scrollY?: number;
}

const RC_KEY = 'wa_return_stack';
const STACK_CAP = 12;

function readStack(): ReturnContext[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(RC_KEY);
    const arr = raw ? (JSON.parse(raw) as ReturnContext[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeStack(stack: ReturnContext[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(RC_KEY, JSON.stringify(stack.slice(-STACK_CAP)));
  } catch {
    /* sessionStorage 不可用时静默降级 */
  }
}

/** 入栈一个返回上下文（列表 → 详情 或 详情 → 详情 时调用） */
export function saveReturnContext(ctx: ReturnContext): void {
  if (typeof window === 'undefined') return;
  const stack = readStack();
  stack.push(ctx);
  writeStack(stack);
}

/** 读取栈顶（最近一次来源的返回上下文），不弹出 */
export function loadReturnContext(): ReturnContext | null {
  const stack = readStack();
  return stack.length ? stack[stack.length - 1] : null;
}

/** 弹出栈顶（返回动作消费一次上下文） */
export function popReturnContext(): ReturnContext | null {
  const stack = readStack();
  if (!stack.length) return null;
  const top = stack.pop()!;
  writeStack(stack);
  return top;
}

/** 清空整个栈（如直接打开详情、跨站进入时） */
export function clearReturnContext(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(RC_KEY);
  } catch {
    /* noop */
  }
}

/** 是否存在站内返回上下文（用于决定 router.back 还是 router.push fallback） */
export function hasReturnContext(): boolean {
  return readStack().length > 0;
}

export interface ListState {
  scrollY: number;
  filters?: Record<string, string>;
}

const listKey = (route: string) => `wa_list_${route}`;

export function saveListState(route: string, state: ListState): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(listKey(route), JSON.stringify(state));
  } catch {
    /* noop */
  }
}

export function loadListState(route: string): ListState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(listKey(route));
    return raw ? (JSON.parse(raw) as ListState) : null;
  } catch {
    return null;
  }
}

/** 读取当前 URL 的查询参数，作为可恢复的筛选快照 */
export function currentFilters(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  p.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}
