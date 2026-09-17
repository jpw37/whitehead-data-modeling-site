import assert from "node:assert/strict";
import test from "node:test";
import { applyApprovedProfileFeed } from "../scripts/student-profile-sync-lib.mjs";

const seed = {
  profiles: [
    {
      slug: "student-one",
      name: "Student One",
      role: "Undergraduate researcher",
      affiliation: "Brigham Young University",
      levels: ["Undergraduate"],
      active: true,
      verified: true,
    },
  ],
};

function feed(submissions) {
  return {
    schemaVersion: 1,
    generatedAt: "2026-09-15T16:00:00.000Z",
    submissions,
  };
}

const update = {
  id: "event-001",
  submittedAt: "2026-09-15T15:00:00.000Z",
  action: "upsert",
  profileId: "student-one",
  name: "Student One",
  degreeLevel: "M.S.",
  years: "2026–present",
  bio: "Student One develops interpretable mathematical models from observed data.",
  researchAreas: ["Interpretable models from data"],
  website: "https://example.edu/student-one",
  professionalLink: "https://github.com/example/student-one",
  photoToken: "photo-001",
};

test("approved updates produce complete public profiles", () => {
  const result = applyApprovedProfileFeed(seed, feed([update]));
  const profile = result.generated.profiles[0];

  assert.equal(profile.role, "Graduate researcher");
  assert.deepEqual(profile.levels, ["M.S."]);
  assert.equal(profile.bio, update.bio);
  assert.equal(profile.photo, "/images/people/student-one.jpg");
  assert.deepEqual(profile.programs, ["Interpretable models from data"]);
  assert.deepEqual(profile.links, [
    { label: "Website", href: "https://example.edu/student-one" },
    { label: "Professional profile", href: "https://github.com/example/student-one" },
  ]);
  assert.deepEqual(result.photosToFetch, [{ slug: "student-one", token: "photo-001" }]);
});

test("a later approved removal removes a profile and portrait", () => {
  const first = applyApprovedProfileFeed(seed, feed([update]));
  const removal = {
    id: "event-002",
    submittedAt: "2026-09-15T15:30:00.000Z",
    action: "remove",
    profileId: "student-one",
  };
  const second = applyApprovedProfileFeed(seed, feed([update, removal]), first.generated.meta);

  assert.deepEqual(second.generated.profiles, []);
  assert.deepEqual(second.photosToRemove, ["student-one"]);
});

test("a later text-only update preserves an approved portrait", () => {
  const laterUpdate = {
    ...update,
    id: "event-002",
    submittedAt: "2026-09-15T15:30:00.000Z",
    bio: "An updated biography that keeps the previously approved portrait.",
    photoToken: "",
  };
  const result = applyApprovedProfileFeed(seed, feed([update, laterUpdate]));

  assert.equal(result.generated.profiles[0].photo, "/images/people/student-one.jpg");
  assert.deepEqual({ ...result.generated.meta.photoVersions }, { "student-one": "photo-001" });
});

test("bare domain links are normalized to HTTPS", () => {
  const result = applyApprovedProfileFeed(seed, feed([{
    ...update,
    website: "example.edu/student-one",
    professionalLink: "www.linkedin.com/in/student-one",
  }]));

  assert.deepEqual(result.generated.profiles[0].links, [
    { label: "Website", href: "https://example.edu/student-one" },
    { label: "Professional profile", href: "https://www.linkedin.com/in/student-one" },
  ]);
});

test("previously published approvals cannot silently disappear or change", () => {
  const first = applyApprovedProfileFeed(seed, feed([update]));

  assert.throws(
    () => applyApprovedProfileFeed(seed, feed([]), first.generated.meta),
    /disappeared from the feed/,
  );
  assert.throws(
    () => applyApprovedProfileFeed(seed, feed([{ ...update, bio: "Edited in place." }]), first.generated.meta),
    /changed/,
  );
});

test("unsafe links and unsupported research areas are rejected", () => {
  assert.throws(
    () => applyApprovedProfileFeed(seed, feed([{ ...update, website: "javascript:alert(1)" }])),
    /must use http or https/,
  );
  assert.throws(
    () => applyApprovedProfileFeed(seed, feed([{ ...update, website: "not a web address" }])),
    /must be a complete web address/,
  );
  assert.throws(
    () => applyApprovedProfileFeed(seed, feed([{ ...update, researchAreas: ["Secret project"] }])),
    /Unsupported research area/,
  );
});
