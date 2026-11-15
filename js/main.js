import { render } from './core/router.js';
import { initSidebar } from './core/sidebar.js';
import { initDock } from './core/dock.js';
import { startDeadlineNotifications } from './actions/deadlineActions.js';

initSidebar();
initDock();
render();
startDeadlineNotifications();
