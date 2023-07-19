#!/usr/bin/env bash

set -e

cd GPTPullRequestReview

current_task_version=$(cat task.json | jq -r '.version | "\(.Major).\(.Minor).\(.Patch)"')

echo "Current task version: $current_task_version"

new_task_version=$(semver -i $current_task_version)

echo "New task version: $new_task_version"

echo "Updating task version in task.json"

cat task.json | jq -r ".version .Major = $(echo $new_task_version | cut -d. -f1)" | jq -r ".version .Minor = $(echo $new_task_version | cut -d. -f2)" | jq -r ".version .Patch = $(echo $new_task_version | cut -d. -f3)" >task.json.tmp

mv task.json.tmp task.json

npm ci

npm run lint

npm run build

cd ../

echo "removing old vsix file"

rm -f *.vsix

echo "Creating bundle"

tfx extension create --manifest-globs vss-extension.json --rev-version --no-prompt

echo "Published vsix file"
