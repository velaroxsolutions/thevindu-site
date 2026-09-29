---
title: The contrastive gap, in plain terms
dek: Why a model trained to put a photo and its caption in the same place keeps them in different neighbourhoods anyway.
date: 2026-08-04
lane: study
tags: [embeddings, contrastive learning, reading]
---

Models like CLIP are trained on a simple instruction: an image and its caption should end
up close together, and far from everything else. Do that across a few hundred million
pairs and you get one shared space where text and images can be compared directly.

Except they don’t really share it. If you plot the embeddings, the images sit in one
region and the text sits in another, with a clear gap between them. Matching pairs are
*closer to each other than to other pairs*, but every image is still closer to other
images than to any caption.

## Why it matters

A lot of what we build on top of these models assumes the space is shared: retrieval,
zero-shot classification, using an image embedding where a text embedding was expected.
The gap means those swaps work less well than the training objective suggests they should.

## What I’m trying to understand

- Where the gap comes from — initialisation, the temperature in the loss, or both.
- Whether closing it actually helps downstream, or just looks tidier.
- What it says about what “the same meaning” is to a model.

This is a placeholder note. Rewrite it in your own words once the reading settles.
