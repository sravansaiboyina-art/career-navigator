import { store } from '../store.js';

export function renderOpportunityDetail(opportunity) {
    if (!opportunity) {
        return `
      <div class="page-wrapper">
        <div class="container" style="padding-top:8rem;">
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Opportunity not found</h3>
            <button class="btn btn-primary mt-4"
              onclick="window.navigateTo('/opportunities')">
              Back to Opportunities
            </button>
          </div>
        </div>
      </div>
    `;
    }

    return `
  <div class="page-wrapper page-enter">
    <div class="container"
         style="padding-top:calc(var(--nav-height) + 2rem);padding-bottom:4rem;max-width:900px;">

      <button
        class="btn btn-ghost mb-6"
        onclick="window.navigateTo('/opportunities')">
        ← Back to Opportunities
      </button>

      <div class="card">

        <div class="flex items-start gap-4">
          <div style="font-size:3rem;">
            ${opportunity.emoji || '🎯'}
          </div>

          <div style="flex:1;">
            <h2>${opportunity.title}</h2>

            <div class="text-sm text-muted mt-2">
              ${opportunity.provider || ''}
            </div>

            <div class="flex gap-2 flex-wrap mt-4">
              <span class="badge badge-violet">
                ${opportunity.type}
              </span>

              <span class="badge badge-green">
                ${opportunity.deadline?.month || 'Deadline TBA'}
              </span>
            </div>
          </div>
        </div>

        <hr style="border-color:var(--border);margin:1.5rem 0;">

        <h4>About this opportunity</h4>

        <p class="text-sm mt-2"
           style="line-height:1.8;">
          ${opportunity.description || 'Information will be updated soon.'}
        </p>

        <div class="card mt-6"
             style="background:var(--bg-glass);">

          <h4>Eligibility</h4>

          <p class="text-sm mt-2">
            ${opportunity.eligibility || 'Check the official notification.'}
          </p>

        </div>

        <div class="card mt-4"
             style="background:var(--bg-glass);">

          <h4>Deadline</h4>

          <p class="text-sm mt-2">
            ${opportunity.deadline?.month || 'Check official website'}
          </p>

          ${opportunity.deadline?.note
            ? `<p class="text-xs text-muted mt-1">
                   ${opportunity.deadline.note}
                 </p>`
            : ''
        }

        </div>

        <div class="mt-6">

          <p class="text-xs text-muted mb-2">
            Always verify the latest eligibility and dates on the official website.
          </p>

          <a
            href="${opportunity.officialLink}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary"
          >
            Visit Official Website ↗
          </a>

        </div>

      </div>

    </div>
  </div>
  `;
}
