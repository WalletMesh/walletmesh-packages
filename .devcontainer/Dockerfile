FROM mcr.microsoft.com/devcontainers/base:bookworm
# Install system dependencies

ARG TZ
ENV TZ="$TZ"

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3-pip \
        python-is-python3 \
        virtualenv \
        ripgrep \
        fzf \
        zsh \
        zsh-doc \
        aggregate \
        jq \
        curl \
        chromium \
    && rm -rf /var/lib/apt/lists/*

ENV DEVCONTAINER=true

# Set environment variables
ENV AIDER_DIR=/opt/aider
ENV PATH="${AIDER_DIR}/bin:${PATH}"
# Install Aider in a single layer
RUN mkdir -p ${AIDER_DIR} \
    && virtualenv ${AIDER_DIR} \
    && ${AIDER_DIR}/bin/python -m pip install --no-cache-dir aider-install \
    && SHELL=/bin/bash HOME=/home/vscode ${AIDER_DIR}/bin/aider-install \
    && ${AIDER_DIR}/bin/pip install --no-cache-dir playwright \
    && ${AIDER_DIR}/bin/playwright install-deps \
    && ${AIDER_DIR}/bin/playwright install chromium \
    && chown -R vscode:vscode ${AIDER_DIR}
# Create symlink for easier access
RUN ln -sf ${AIDER_DIR}/bin/aider /usr/local/bin/aider

ARG USERNAME=vscode
 
RUN chown $USERNAME:$USERNAME /home/vscode/.cache
USER vscode
ENV SHELL=/bin/zsh

# Claude environment variables
ENV DISABLE_TELEMETRY=1
