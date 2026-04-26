# Project Medora Hub

**Privacy-Preserving Federated Analytics for Clinical Trials**

Project Medora Hub is a decentralized query engine designed to bridge the gap between pharmaceutical companies and hospital networks. It allows clinical trial sponsors to find eligible patient cohorts across multiple hospitals without requiring any patient records to leave the hospital's internal network.

---

## Table of Contents
1. [The Problem](#the-problem)
2. [The Solution](#the-solution)
3. [Data Security & Privacy](#data-security--privacy)
4. [Business Plan](#business-plan)
5. [Project Structure](#project-structure)
6. [Detailed Tech Stack](#detailed-tech-stack)
7. [Installation and Setup](#installation-and-setup)
8. [Q&A for Judges](#qa-for-judges)
9. [License](#license)

---

## The Problem

Clinical trials currently face a massive recruitment and financial bottleneck caused by strict data privacy regulations.

* 80 percent of all clinical trials fail to meet initial enrollment timelines, and 11 percent of research sites fail to enroll a single patient (Source: Tufts Center for the Study of Drug Development).
* The industry average cost to recruit a single patient is $6,533. If a patient drops out, replacing them costs up to $19,533 (Source: mdgroup).
* Delayed trials cost pharmaceutical companies between $600,000 and $8 million per day in lost revenue (Source: CenterWatch / Cutting Edge Information).

Hospitals possess the patient data required to solve this problem, but strict compliance laws prevent them from legally sharing Electronic Health Records (EHR) with outside sponsors.

---

## The Solution

Medora solves this through a Zero Data Egress architecture. Rather than moving patient data to a centralized cloud for analysis, Medora sends the mathematical query to the hospital's local data.

1. **The Hub (Cloud):** Sponsors build clinical trial criteria using a visual dashboard.
2. **The Queue (Broker):** The criteria is packaged into a JSON payload and sent to a secure, persistent queue.
3. **The Edge Node (Hospital):** A lightweight application running behind the hospital's firewall pulls the payload, queries the local database, and returns only a fuzzed, anonymous patient count.

---

## Data Security & Privacy

We have engineered the system to ensure patient data cannot be leaked, accessed, or reverse-engineered by external sponsors.

* **Zero Data Egress:** Patient records never leave the hospital network. The system only transmits mathematical counts.
* **Deterministic AST Parsing:** We explicitly avoid using Generative AI or LLMs inside the hospital database to prevent SQL injection or hallucinations. The AST parser converts JSON to strict, predictable SQL.
* **K-Anonymity Shield:** If a query returns a cohort of fewer than 5 patients, the system drops the count to zero. This mathematically prevents "Differencing Attacks" aimed at isolating specific individuals.
* **Differential Privacy:** The Edge Node applies Laplace Noise to the final aggregate count, blurring the exact number to comply with strict de-identification standards.
* **Cryptographic Signatures:** The hospital node signs the execution using HMAC-SHA256, proving the result was generated authentically without manual tampering.

---

## Business Plan

Medora operates as a B2B Federated Data Marketplace, matching pharmaceutical demand with hospital data supply.

### Revenue Model (Pharma Pays)
1. **SaaS Platform Fee:** Pharmaceutical companies and Clinical Research Organizations pay a monthly licensing fee for Hub access and trial management.
2. **Pay-Per-Query Execution:** Sponsors pay a micro-transaction fee every time they broadcast a search query to the network.
3. **Recruitment Commission:** Medora takes a 10 to 20 percent bounty commission on successful patient enrollment matches facilitated by the platform.

### Hospital Incentives (Supply Side)
* **Revenue Share:** Hospitals receive 70 percent of the query fees paid by sponsors.
* **Zero Liability:** Because the software operates offline behind firewalls with zero data egress, hospitals face zero regulatory compliance risk.
* **Passive Income:** The hospital monetizes its existing EHR data with no manual IT labor required.

---

## Project Structure

```text
squidwarddevs-ol11/
├── backend/                  # The Cloud Hub API (Sponsor facing)
│   ├── models/               # Database schemas for the Hub
│   ├── modules/              # Core logic (Auth, Trial Builder, Orchestrator)
│   ├── Dockerfile            # Container configuration for the Hub
│   ├── main.py               # FastAPI entry point
│   └── requirements.txt      # Python dependencies
├── edge_node/                # The Hospital Application (Local execution)
│   ├── models/               # Local EHR database schemas
│   ├── modules/              # Edge logic (AST Parser, Privacy Engine, ZKP)
│   ├── Dockerfile            # Container configuration for the Edge Node
│   ├── main.py               # FastAPI entry point
│   └── requirements.txt      # Python dependencies
├── frontend/                 # The React User Interface
│   ├── src/                  # React components, API connectors, styling
│   ├── Dockerfile            # Container configuration for the frontend
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Frontend build configuration
├── docker-compose.yml        # Cloud Hub & Frontend orchestration
└── README.md                 # Project documentation
```

---

## Detailed Tech Stack

### Cloud Hub & Edge Node (Backend)

* **FastAPI:** High performance asynchronous API framework.
* **PostgreSQL:** Reliable relational storage for clinical data.
* **SQLAlchemy:** Secure query generation and object mapping.
* **Redis:** Persistent message queue for reliable broadcasting.

### User Interface (Frontend)

* **React:** Component based dynamic user interface.
* **TypeScript:** Static typing prevents complex runtime errors.
* **Vite:** Lightning fast frontend development build tool.
* **Tailwind CSS:** Utility classes for rapid responsive styling.

### Cryptography & Privacy Engine

* **HMAC-SHA256:** Tamper evident cryptographic execution signature generation.
* **Laplace Noise:** Mathematical engine for differential privacy blurring.
* **K-Anonymity Logic:** Minimum threshold verification prevents differencing attacks.

---

## Installation and Setup

### Prerequisites

* Docker and Docker Compose installed on your machine.
* Git installed.

### 1. Clone the Repository

```bash
git clone https://github.com/logizel/squidwarddevs-ol11.git
cd squidwarddevs-ol11
```

### 2. Start the Cloud Hub & Frontend

The root docker-compose.yml handles the central broker, the PostgreSQL database for the Hub, the FastAPI backend, and the Vite React frontend.

```bash
docker compose up --build -d
```

* The Hub API documentation is available at http://localhost:8000/docs.
* The React Frontend is available at http://localhost:5173.

### 3. Start the Hospital Edge Node

The Edge Node runs in its own isolated container environment to simulate a remote hospital network.

```bash
cd edge_node
docker compose up --build -d
```

The Edge Node will initialize its local EHR database, connect to the Redis broker, and begin listening for tasks. You can view the real-time execution logs using:

```bash
docker logs -f edge_api_node
```

---

## Q&A for Judges

**Q: What currently exists in this space, and what makes Medora better?**

Existing data brokers require hospitals to upload de-identified patient data to centralized cloud servers. This creates massive cybersecurity targets and requires months of complex legal negotiations. Medora is better because we use a Zero Data Egress architecture. Patient records never leave the hospital firewall, completely eliminating the hospital's legal liability.

**Q: How is this approach different from the traditional method, and what are the perks?**

The traditional method relies on hospital staff manually reading through patient charts, which takes months and is prone to human error. Medora automates this search across multiple hospitals simultaneously. The primary perk is reducing trial feasibility and recruitment timelines from months to seconds while maintaining absolute patient privacy.

**Q: Is it legal to access hospital data this way?**

We do not access or process personal patient data. Under the Digital Personal Data Protection Act of 2023, data that is mathematically anonymized is exempt from standard processing restrictions. Because our Edge Node only transmits aggregated, fuzzed counts, we comply with national laws and ICMR ethical guidelines for research feasibility.

**Q: Why use an AST Parser instead of an AI model on the Edge Node?**

Deploying Generative AI inside a hospital firewall to write SQL against live health records is a major security risk, as LLMs can hallucinate destructive commands. Our AST Parser is deterministic. It programmatically builds safe, completely predictable SQL in milliseconds and requires zero expensive GPU compute.

**Q: How do you prevent a sponsor from identifying a specific patient?**

We use K-Anonymity to automatically drop any result that yields fewer than five patients. We also apply Laplace Noise to blur the final aggregate count. This makes it mathematically impossible for a sponsor to isolate an individual through repeated queries.

**Q: What happens if the hospital network goes offline during a broadcast?**

We abandoned standard Pub/Sub communication for persistent Redis queuing. If a hospital loses connection, the broadcast waits safely in the cloud queue. When the hospital reconnects, it immediately pulls the task backlog, ensuring zero message loss.

---

## License

This project is licensed under the terms of the MIT license. See the LICENSE file for more details.
