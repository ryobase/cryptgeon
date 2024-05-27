use actix_web::web;

use crate::config;
use crate::health;
use crate::note;
use crate::status;

pub fn init(cfg: &mut web::ServiceConfig) {
    let mut prefix: String = String::new();

    if !config::PREFIX_ROUTE.to_string().eq("") {        
        prefix.push('/');
        prefix.push_str(&config::PREFIX_ROUTE.to_string());
    }

    prefix.push_str("/api");

    cfg.service(
        web::scope(&prefix)
            .service(note::init())
            .service(status::init())
            .service(health::init()),
    );
}
