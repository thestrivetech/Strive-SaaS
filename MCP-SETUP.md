# MCP Server Setup Guide

**Model Context Protocol (MCP) Configuration**

## 🔐 Security Notice

**NEVER commit `.mcp.json` to git!** This file contains sensitive access tokens.

- ✅ `.mcp.json` is in `.gitignore`
- ✅ Use `.mcp.json.example` as a template
- ❌ Do not share your personal `.mcp.json` file

---

## 📋 Initial Setup

### Step 1: Copy the Example File

```bash
cp .mcp.json.example .mcp.json
```

### Step 2: Get Your Supabase Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Account Settings** → **Access Tokens**
3. Click "Generate new token"
4. Give it a descriptive name (e.g., "MCP Development Token")
5. Copy the token (starts with `sbp_`)

### Step 3: Update .mcp.json

Open `.mcp.json` and replace `[YOUR-SUPABASE-ACCESS-TOKEN]` with your actual token:

```json
{
  "$schema": "https://modelcontextprotocol.io/schemas/mcp.json",
  "mcpServers": {
    "supabase-production": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=bztkedvdjbxffpjxihtc"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_your_actual_token_here"
      }
    }
  }
}
```

### Step 4: Verify Setup

Test the MCP server connection:

```bash
npx @supabase/mcp-server-supabase --project-ref=bztkedvdjbxffpjxihtc
```

---

## 🔒 Security Best Practices

### Token Security

- **Rotate tokens regularly:** Every 90 days
- **Use separate tokens:** Production vs Development
- **Revoke unused tokens:** Remove old tokens from Supabase dashboard
- **Limit token scope:** Use read-only tokens when possible

### File Security

```bash
# Verify .mcp.json is NOT tracked by git
git ls-files | grep ".mcp.json"
# (should return nothing)

# Verify .mcp.json is in .gitignore
grep ".mcp.json" .gitignore
# (should show: .mcp.json)
```

### If Token is Exposed

1. **Immediately revoke** the exposed token in Supabase dashboard
2. **Generate new token**
3. **Update** your local `.mcp.json`
4. **Review access logs** in Supabase for suspicious activity

---

## 📚 MCP Server Configuration

### Production Server

- **Project:** `bztkedvdjbxffpjxihtc`
- **Purpose:** Production database access
- **Access:** Full read/write (be careful!)

### Test Server

- **Project:** `epstwhwqjvmczzpiioqz`
- **Purpose:** Testing and development
- **Access:** Read-only (safer for testing)

---

## 🐛 Troubleshooting

### "SUPABASE_ACCESS_TOKEN not set"

**Solution:** Make sure your `.mcp.json` file exists and contains your token.

### "Invalid access token"

**Solutions:**
1. Token may have expired - generate a new one
2. Token may have been revoked - check Supabase dashboard
3. Typo in token - verify you copied the entire token

### "Cannot connect to Supabase"

**Solutions:**
1. Check your internet connection
2. Verify project reference ID is correct
3. Ensure Supabase project is active (not paused)

---

## 🔗 Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)
- [Supabase Access Tokens](https://supabase.com/docs/guides/api/api-keys)

---

**Last Updated:** 2025-10-08
**Maintained By:** DevOps Team
