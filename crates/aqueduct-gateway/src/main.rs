use aqueduct_core::{FaucetIntent, PolicyContext};
use aqueduct_policy::evaluate;
use axum::{extract::State, http::StatusCode, routing::{get, post}, Json, Router};
use serde::{Deserialize, Serialize};
use std::{net::SocketAddr, sync::Arc};
use tokio::net::TcpListener;
use tower_http::{cors::{Any, CorsLayer}, trace::TraceLayer};
use tracing::info;

#[derive(Clone)]
struct AppState {
    service_name: &'static str,
}

#[derive(Debug, Deserialize)]
struct EvaluateRequest {
    intent: FaucetIntent,
    context: PolicyContext,
}

#[derive(Debug, Serialize)]
struct EvaluateResponse {
    service: &'static str,
    decision: aqueduct_core::Decision,
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    service: &'static str,
    status: &'static str,
    execution_enabled: bool,
    mainnet_allowed: bool,
}

async fn health(State(state): State<Arc<AppState>>) -> Json<HealthResponse> {
    Json(HealthResponse {
        service: state.service_name,
        status: "ok",
        execution_enabled: false,
        mainnet_allowed: false,
    })
}

async fn evaluate_intent(
    State(state): State<Arc<AppState>>,
    Json(request): Json<EvaluateRequest>,
) -> Result<Json<EvaluateResponse>, StatusCode> {
    request.intent.validate().map_err(|_| StatusCode::BAD_REQUEST)?;
    Ok(Json(EvaluateResponse {
        service: state.service_name,
        decision: evaluate(&request.intent, &request.context),
    }))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let state = Arc::new(AppState { service_name: "aqueduct-gateway" });
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        .route("/v1/policy/evaluate", post(evaluate_intent))
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8787));
    let listener = TcpListener::bind(addr).await?;
    info!(%addr, "AQUEDUCT Rust gateway listening");
    axum::serve(listener, app).await?;
    Ok(())
}
