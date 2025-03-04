FROM mcr.microsoft.com/devcontainers/base:bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3-pip \
        python-is-python3 \
        virtualenv \
    && rm -rf /var/lib/apt/lists/*


# Install Aider
RUN virtualenv /venv-aider
RUN /venv-aider/bin/python -m pip install aider-install
RUN SHELL=/bin/bash HOME=/home/vscode /venv-aider/bin/aider-install
RUN /venv-aider/bin/pip install playwright
RUN /venv-aider/bin/playwright install-deps
RUN /venv-aider/bin/playwright install chromium

USER vscode
