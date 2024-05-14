use bcc::perf_event::PerfMapBuilder;
use bcc::BccError;
use bcc::{Kprobe, Kretprobe, BPF};

static CCODE: &str = include_str!(r"../stest.c");
static SPINNER: &str = r"/-\|";

fn main() -> Result<(), BccError> {

    // Create Progra,
    let mut module = BPF::new(CCODE)?;

    let mut perf_map = PerfMapBuilder::new(module.table("events").unwrap(), perf_data_callback)
        .page_count(64)
        .build()
        .unwrap();

    eprintln!("{}",module.get_kprobe_functions(".").unwrap().len());

    let mut i: usize = 0;
    loop {
        eprint!("\u{8}{}",SPINNER.chars().nth({i+=1;i}%SPINNER.len()).unwrap());
        perf_map.poll(200);
        // module.perf_map_poll(100);
    }
}

fn perf_data_callback() -> Box<dyn FnMut(&[u8]) + Send> {
    Box::new(|_x| {
        eprintln!("Data callback");
    })
}
