/**
 * Human-in-the-Loop Approval Manager
 *
 * Critical operations (publishing, budget changes) require human approval
 * before execution. This prevents full autonomous execution risks.
 */

export interface ApprovalRequest {
  id: string;
  taskId: string;
  agentId: string;
  action: "publish_campaign" | "increase_budget" | "change_targeting" | "deploy";
  description: string;
  proposedChanges: Record<string, unknown>;
  riskLevel: "low" | "medium" | "high" | "critical";
  createdAt: number;
  expiresAt: number;
  status: "pending" | "approved" | "rejected";
}

export interface ApprovalHistory {
  requestId: string;
  approverNote: string;
  decision: "approved" | "rejected";
  decidedAt: number;
  decidedBy: string;
}

class ApprovalManager {
  private requests = new Map<string, ApprovalRequest>();
  private history: ApprovalHistory[] = [];
  private pendingApprovals = 0;

  createApprovalRequest(
    taskId: string,
    agentId: string,
    action: ApprovalRequest["action"],
    description: string,
    proposedChanges: Record<string, unknown>,
    riskLevel: ApprovalRequest["riskLevel"] = "medium"
  ): ApprovalRequest {
    const request: ApprovalRequest = {
      id: `approve-${taskId}-${Date.now()}`,
      taskId,
      agentId,
      action,
      description,
      proposedChanges,
      riskLevel,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hour expiry
      status: "pending",
    };

    this.requests.set(request.id, request);
    this.pendingApprovals++;

    console.log(
      `⏳ Approval request created: ${request.id} (${request.riskLevel})`
    );
    return request;
  }

  getPendingRequests(
    riskLevel?: ApprovalRequest["riskLevel"]
  ): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter((r) => {
      if (r.status !== "pending") return false;
      if (r.expiresAt < Date.now()) return false;
      if (riskLevel && r.riskLevel !== riskLevel) return false;
      return true;
    });
  }

  approveRequest(
    requestId: string,
    approverNote: string,
    approver: string
  ): boolean {
    const request = this.requests.get(requestId);
    if (!request || request.status !== "pending") {
      return false;
    }

    request.status = "approved";
    this.pendingApprovals--;

    this.history.push({
      requestId,
      approverNote,
      decision: "approved",
      decidedAt: Date.now(),
      decidedBy: approver,
    });

    console.log(`✅ Approval granted: ${requestId}`);
    return true;
  }

  rejectRequest(
    requestId: string,
    reason: string,
    approver: string
  ): boolean {
    const request = this.requests.get(requestId);
    if (!request || request.status !== "pending") {
      return false;
    }

    request.status = "rejected";
    this.pendingApprovals--;

    this.history.push({
      requestId,
      approverNote: reason,
      decision: "rejected",
      decidedAt: Date.now(),
      decidedBy: approver,
    });

    console.log(`❌ Approval rejected: ${requestId}`);
    return true;
  }

  getRequest(requestId: string): ApprovalRequest | undefined {
    return this.requests.get(requestId);
  }

  getHistory(taskId?: string): ApprovalHistory[] {
    if (!taskId) return this.history;
    return this.history.filter((h) => {
      const req = this.requests.get(h.requestId);
      return req?.taskId === taskId;
    });
  }

  getPendingCount(): number {
    return this.pendingApprovals;
  }

  isApprovalRequired(action: ApprovalRequest["action"]): boolean {
    // Critical actions always require approval
    const criticalActions = [
      "publish_campaign",
      "increase_budget",
      "deploy",
    ];
    return criticalActions.includes(action);
  }

  canExecute(requestId: string): boolean {
    const request = this.requests.get(requestId);
    return request?.status === "approved" ?? false;
  }
}

export const approvalManager = new ApprovalManager();
