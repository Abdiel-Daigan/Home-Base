import { render } from './core/router.js';
import { initSidebar } from './core/sidebar.js';
import { startDeadlineNotifications } from './actions/deadlineActions.js';

initSidebar();                    // ← new
render();
startDeadlineNotifications();
