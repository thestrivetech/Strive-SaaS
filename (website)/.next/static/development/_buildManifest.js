self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [
      {
        "has": [
          {
            "type": "host",
            "value": "strivetech.ai"
          }
        ],
        "source": "/:path*",
        "destination": "/:path*"
      },
      {
        "has": [
          {
            "type": "host",
            "value": "www.strivetech.ai"
          }
        ],
        "source": "/:path*",
        "destination": "/:path*"
      },
      {
        "has": [
          {
            "type": "host",
            "value": "app.strivetech.ai"
          }
        ],
        "source": "/:path*",
        "destination": "/:path*"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()