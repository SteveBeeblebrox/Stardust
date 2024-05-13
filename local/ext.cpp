#include <linux/sched.h>
#include <linux/nsproxy.h>

int get_kernel_pid(struct task_struct *task) {
    return task->pid;
}