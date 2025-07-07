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
ARG USERNAME=vscode
USER vscode
ENV SHELL=/bin/zsh

# Claude environment variables
ENV DISABLE_TELEMETRY=1
